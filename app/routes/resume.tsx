import * as React from "react"
import { Link, useNavigate, useParams } from "react-router"

import { ResumeDescriptionAiDialog } from "~/components/resume/resume-description-ai-dialog"
import { ResumeLinkedMultiFieldset } from "~/components/resume/resume-linked-multi-fieldset"
import { WorkExperienceSkillFieldset } from "~/components/work-experience/work-experience-skill-fieldset"
import type {
  Certification,
  Education,
  ResumeDocument,
  Role,
  Skill,
  WorkExperience,
} from "~/components/providers/app-data-provider"
import { AppLayout } from "~/components/layout/app-layout"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import type { ResumeDescriptionAiContext } from "~/lib/resume-ai-description"
import { ApiError } from "~/lib/api/errors"
import type { ApiCertification } from "~/lib/api/resources/certifications"
import { listCertifications } from "~/lib/api/resources/certifications"
import type { ApiEducation } from "~/lib/api/resources/educations"
import { listEducations } from "~/lib/api/resources/educations"
import { listRoles } from "~/lib/api/resources/roles"
import {
  apiResumeToResumeDocument,
  createResume as createResumeApi,
  getResume,
  syncResumeCertifications,
  syncResumeEducations,
  syncResumeSkills,
  syncResumeWorkExperiences,
  updateResume as updateResumeApi,
} from "~/lib/api/resources/resumes"
import type { ApiSkill } from "~/lib/api/resources/skills"
import { listSkills } from "~/lib/api/resources/skills"
import type { ApiWorkExperience } from "~/lib/api/resources/work-experiences"
import { listWorkExperiences } from "~/lib/api/resources/work-experiences"
import { apiRoleToRole } from "~/lib/opportunity-api-mappers"
import { SparklesIcon } from "lucide-react"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"

function apiErrorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const firstField = Object.values(err.fieldErrors).flat()[0]
    if (firstField) return firstField
  }
  return fallback
}

function apiWorkExperienceToWorkExperience(w: ApiWorkExperience): WorkExperience {
  return {
    id: w.id,
    title: w.title,
    company_name: w.company_name,
    is_remote: w.is_remote,
    date_from: w.date_from ?? "",
    date_to: w.date_to ?? "",
    skill_ids: w.skill_ids ?? [],
  }
}

function apiCertificationToCertification(c: ApiCertification): Certification {
  return {
    id: c.id,
    name: c.name,
    date_from: c.date_from ?? "",
    date_to: c.date_to ?? "",
  }
}

function apiEducationToEducation(e: ApiEducation): Education {
  return {
    id: e.id,
    institution_name: e.institution_name,
    degree: e.degree ?? "",
    field_of_study: e.field_of_study ?? "",
    date_from: e.date_from ?? "",
    date_to: e.date_to ?? "",
  }
}

function apiSkillToSkill(s: ApiSkill): Skill {
  return {
    id: s.id,
    name: s.name,
    description: s.description ?? "",
  }
}

function normalizeEntityId(raw: string): string {
  return raw.trim().toLowerCase()
}

/**
 * Alinha o id vindo do currículo ao valor exato de `roles` (Radix Select exige match estrito).
 * Sem match na lista → string vazia (evita `value` inválido no Select).
 */
function canonicalRoleIdFromRolesList(roles: readonly Role[], resumeRoleId: string): string {
  const trimmed = resumeRoleId.trim()
  if (!trimmed) return ""
  const needle = normalizeEntityId(trimmed)
  const found = roles.find((r) => normalizeEntityId(r.id) === needle)
  return found ? found.id : ""
}

async function syncResumeRelations(
  resumeId: string,
  payload: {
    work_experience_ids: string[]
    certification_ids: string[]
    education_ids: string[]
    skill_ids: string[]
  }
): Promise<void> {
  await Promise.all([
    syncResumeWorkExperiences(resumeId, payload.work_experience_ids),
    syncResumeCertifications(resumeId, payload.certification_ids),
    syncResumeEducations(resumeId, payload.education_ids),
    syncResumeSkills(resumeId, payload.skill_ids),
  ])
}

export default function ResumeDocumentPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [roles, setRoles] = React.useState<Role[]>([])
  const [workExperiences, setWorkExperiences] = React.useState<WorkExperience[]>([])
  const [certifications, setCertifications] = React.useState<Certification[]>([])
  const [education, setEducation] = React.useState<Education[]>([])
  const [skills, setSkills] = React.useState<Skill[]>([])

  const [pageStatus, setPageStatus] = React.useState<
    "loading" | "ready" | "error" | "not_found"
  >("loading")
  const [pageError, setPageError] = React.useState<string | null>(null)

  const [editDocument, setEditDocument] = React.useState<ResumeDocument | null>(null)

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [workExperienceIds, setWorkExperienceIds] = React.useState<string[]>([])
  const [certificationIds, setCertificationIds] = React.useState<string[]>([])
  const [educationIds, setEducationIds] = React.useState<string[]>([])
  const [skillIds, setSkillIds] = React.useState<string[]>([])
  const [aiDialogOpen, setAiDialogOpen] = React.useState(false)
  const [postSaveOpen, setPostSaveOpen] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [retryNonce, setRetryNonce] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setPageStatus("loading")
      setPageError(null)
      setEditDocument(null)
      try {
        const [rolesApi, weApi, certApi, eduApi, skApi] = await Promise.all([
          listRoles({ paginated: false }),
          listWorkExperiences({ paginated: false }),
          listCertifications({ paginated: false }),
          listEducations({ paginated: false }),
          listSkills({ paginated: false }),
        ])
        if (cancelled) return
        setRoles(rolesApi.map(apiRoleToRole))
        setWorkExperiences(weApi.map(apiWorkExperienceToWorkExperience))
        setCertifications(certApi.map(apiCertificationToCertification))
        setEducation(eduApi.map(apiEducationToEducation))
        setSkills(skApi.map(apiSkillToSkill))

        if (id) {
          try {
            const api = await getResume(id)
            if (cancelled) return
            setEditDocument(apiResumeToResumeDocument(api))
          } catch (e) {
            if (cancelled) return
            if (e instanceof ApiError && e.status === 404) {
              setPageStatus("not_found")
              return
            }
            throw e
          }
        }
        if (!cancelled) setPageStatus("ready")
      } catch (e) {
        if (!cancelled) {
          setPageStatus("error")
          setPageError(apiErrorText(e, "Could not load resume data."))
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id, retryNonce])

  const rolesIdSignature = React.useMemo(
    () => roles.map((r) => r.id).sort().join("\0"),
    [roles]
  )

  /** Preferência explícita do usuário; senão, o role persistido no currículo (evita depender só de effects). */
  const resolvedSelectRoleId = React.useMemo(() => {
    const raw =
      roleId.trim() !== ""
        ? roleId.trim()
        : (editDocument?.role_id ?? "").trim()
    if (!raw || roles.length === 0) return ""
    return canonicalRoleIdFromRolesList(roles, raw)
  }, [roleId, editDocument?.role_id, roles, rolesIdSignature])

  React.useLayoutEffect(() => {
    if (!id) {
      setTitle("")
      setDescription("")
      setRoleId("")
      setWorkExperienceIds([])
      setCertificationIds([])
      setEducationIds([])
      setSkillIds([])
      return
    }
    if (!editDocument) return
    setTitle(editDocument.title)
    setDescription(editDocument.description)
    setWorkExperienceIds([...editDocument.work_experience_ids])
    setCertificationIds([...editDocument.certification_ids])
    setEducationIds([...editDocument.education_ids])
    setSkillIds([...editDocument.skill_ids])
  }, [id, editDocument])

  function resetForm() {
    setTitle("")
    setDescription("")
    setRoleId("")
    setWorkExperienceIds([])
    setCertificationIds([])
    setEducationIds([])
    setSkillIds([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    if (roles.length > 0 && resolvedSelectRoleId === "") {
      return
    }
    const validWe = new Set(workExperiences.map((w) => w.id))
    const validCert = new Set(certifications.map((c) => c.id))
    const validEdu = new Set(education.map((ed) => ed.id))
    const validSk = new Set(skills.map((s) => s.id))
    const relationPayload = {
      work_experience_ids: workExperienceIds.filter((wid) => validWe.has(wid)),
      certification_ids: certificationIds.filter((cid) => validCert.has(cid)),
      education_ids: educationIds.filter((eid) => validEdu.has(eid)),
      skill_ids: skillIds.filter((sid) => validSk.has(sid)),
    }
    const trimmedDesc = description.trim()
    const corePayload = {
      title: title.trim(),
      description: trimmedDesc === "" ? null : trimmedDesc,
      role_id:
        roles.length === 0
          ? ""
          : resolvedSelectRoleId,
    }

    setSaving(true)
    try {
      if (isEdit && id) {
        await updateResumeApi(id, corePayload)
        await syncResumeRelations(id, relationPayload)
        navigate("/resumes")
      } else {
        const created = await createResumeApi(corePayload)
        await syncResumeRelations(created.id, relationPayload)
        setPostSaveOpen(true)
      }
    } catch (err) {
      setSaveError(apiErrorText(err, "Could not save resume."))
    } finally {
      setSaving(false)
    }
  }

  const pageTitle = isEdit ? "Edit resume" : "New resume"
  const crumbAction = isEdit ? "Edit" : "New"

  const workExperienceRows = workExperiences.map((w) => ({
    id: w.id,
    primary: w.title,
    secondary: w.company_name,
  }))
  const certificationRows = certifications.map((c) => ({
    id: c.id,
    primary: c.name,
    secondary: c.date_from && c.date_to ? `${c.date_from} → ${c.date_to}` : undefined,
  }))
  const educationRows = education.map((ed) => ({
    id: ed.id,
    primary: ed.institution_name,
    secondary: `${ed.degree} — ${ed.field_of_study}`,
  }))

  const hasValidRole =
    roles.length === 0 || resolvedSelectRoleId !== ""
  const canSave = hasValidRole && !saving

  const aiContext = React.useMemo((): ResumeDescriptionAiContext => {
    const roleName = resolvedSelectRoleId
      ? roles.find((r) => r.id === resolvedSelectRoleId)?.name ?? null
      : null
    const workExperienceSummaries = workExperienceIds
      .map((wid) => workExperiences.find((w) => w.id === wid))
      .filter((w): w is NonNullable<typeof w> => w != null)
      .map((w) => `${w.title} (${w.company_name})`)
    const certificationNames = certificationIds
      .map((cid) => certifications.find((c) => c.id === cid)?.name)
      .filter((n): n is string => Boolean(n))
    const educationSummaries = educationIds
      .map((eid) => education.find((e) => e.id === eid))
      .filter((e): e is NonNullable<typeof e> => e != null)
      .map((e) => `${e.institution_name} — ${e.degree}`)
    const skillNames = skillIds
      .map((sid) => skills.find((s) => s.id === sid)?.name)
      .filter((n): n is string => Boolean(n))
    return {
      title,
      roleName,
      workExperienceSummaries,
      certificationNames,
      educationSummaries,
      skillNames,
      previousDescription: description,
    }
  }, [
    title,
    resolvedSelectRoleId,
    roles,
    workExperienceIds,
    workExperiences,
    certificationIds,
    certifications,
    educationIds,
    education,
    skillIds,
    skills,
    description,
  ])

  if (pageStatus === "loading") {
    return (
      <AppLayout
        title={pageTitle}
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Resumes", to: "/resumes" },
          { label: crumbAction },
        ]}
      >
        <p className="text-muted-foreground py-12 text-center text-sm">Loading…</p>
      </AppLayout>
    )
  }

  if (pageStatus === "error") {
    return (
      <AppLayout
        title={pageTitle}
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Resumes", to: "/resumes" },
          { label: crumbAction },
        ]}
      >
        <p className="text-destructive px-1 text-sm" role="alert">
          {pageError ?? "Something went wrong."}{" "}
          <Button
            type="button"
            variant="link"
            className="text-destructive h-auto p-0 align-baseline underline"
            onClick={() => setRetryNonce((n) => n + 1)}
          >
            Retry
          </Button>
        </p>
      </AppLayout>
    )
  }

  if (pageStatus === "not_found") {
    return (
      <AppLayout
        title="Resume not found"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Resumes", to: "/resumes" },
          { label: "Not found" },
        ]}
      >
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Resume not found</CardTitle>
            <CardDescription>
              This resume does not exist or you no longer have access to it.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/resumes">Back to resumes</Link>
            </Button>
          </CardFooter>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={pageTitle}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Resumes", to: "/resumes" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {saveError ? (
          <p className="text-destructive mb-4 text-sm" role="alert">
            {saveError}
          </p>
        ) : null}
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update this saved resume. Link one role and any number of experiences, certifications, education rows, and skills."
                : "Create a resume: pick the target role, then attach supporting records."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="resume-title">Title</FieldLabel>
                  <Input
                    id="resume-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Full stack — EU remote"
                    required
                  />
                </Field>
                <Field>
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <FieldLabel htmlFor="resume-desc" className="mb-0">
                      Description
                    </FieldLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAiDialogOpen(true)}
                    >
                      <SparklesIcon data-icon="inline-start" />
                      Generate with AI
                    </Button>
                  </div>
                  <Textarea
                    id="resume-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short summary, target roles, or notes for this version."
                    required
                    rows={4}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="resume-role">Role</FieldLabel>
                  {roles.length > 0 ? (
                    <Select
                      key={`${id ?? "new"}-${rolesIdSignature}`}
                      value={
                        resolvedSelectRoleId === "" ? undefined : resolvedSelectRoleId
                      }
                      onValueChange={setRoleId}
                      required
                    >
                      <SelectTrigger id="resume-role" className="w-full min-w-0">
                        <SelectValue placeholder="Select one role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {roles.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p
                      id="resume-role"
                      className="text-muted-foreground flex min-h-8 items-center text-sm"
                    >
                      No roles defined yet. Add a role under Reference first.
                    </p>
                  )}
                  {roles.length > 0 && !hasValidRole ? (
                    <FieldDescription className="text-destructive">
                      Select a role to enable saving.
                    </FieldDescription>
                  ) : null}
                </Field>
              </FieldGroup>

              <div className="mt-6 flex flex-col gap-6">
                <ResumeLinkedMultiFieldset
                  idPrefix="resume-we"
                  legend="Work experience"
                  description="Experiences to include on this resume."
                  rows={workExperienceRows}
                  selectedIds={workExperienceIds}
                  onSelectedIdsChange={setWorkExperienceIds}
                />
                <ResumeLinkedMultiFieldset
                  idPrefix="resume-cert"
                  legend="Certifications"
                  description="Credentials to highlight."
                  rows={certificationRows}
                  selectedIds={certificationIds}
                  onSelectedIdsChange={setCertificationIds}
                />
                <ResumeLinkedMultiFieldset
                  idPrefix="resume-edu"
                  legend="Education"
                  description="Academic entries to list."
                  rows={educationRows}
                  selectedIds={educationIds}
                  onSelectedIdsChange={setEducationIds}
                />
                <WorkExperienceSkillFieldset
                  idPrefix="resume-skills"
                  skills={skills}
                  skillIds={skillIds}
                  onSkillIdsChange={setSkillIds}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!canSave}>
                {saving ? "Saving…" : isEdit ? "Save changes" : "Save"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        <ResumeDescriptionAiDialog
          open={aiDialogOpen}
          onOpenChange={setAiDialogOpen}
          initialDescription={description}
          context={aiContext}
          onApply={setDescription}
        />
      </div>
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel="Resume"
        onGoToList={() => navigate("/resumes")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
