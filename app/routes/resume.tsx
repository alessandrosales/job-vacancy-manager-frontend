import * as React from "react"
import { useNavigate, useParams } from "react-router"

import { ResumeDescriptionAiDialog } from "~/components/resume/resume-description-ai-dialog"
import { ResumeLinkedMultiFieldset } from "~/components/resume/resume-linked-multi-fieldset"
import { WorkExperienceSkillFieldset } from "~/components/work-experience/work-experience-skill-fieldset"
import { useAppData } from "~/components/providers/app-data-provider"
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
import { SparklesIcon } from "lucide-react"

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function ResumeDocumentPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const {
    resumes,
    addResume,
    updateResume,
    roles,
    work_experiences,
    certifications,
    education,
    skills,
  } = useAppData()
  const existing = id ? resumes.find((r) => r.id === id) : undefined

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [workExperienceIds, setWorkExperienceIds] = React.useState<string[]>([])
  const [certificationIds, setCertificationIds] = React.useState<string[]>([])
  const [educationIds, setEducationIds] = React.useState<string[]>([])
  const [skillIds, setSkillIds] = React.useState<string[]>([])
  const [aiDialogOpen, setAiDialogOpen] = React.useState(false)

  /** Evita resetar o formulário só porque `existing` ganhou nova referência no provider (mesmos dados). */
  const resumeHydrateKey = React.useMemo(() => {
    if (!id) return "new"
    if (!existing) return `pending:${id}`
    const we = [...existing.work_experience_ids].sort().join("\0")
    const ce = [...existing.certification_ids].sort().join("\0")
    const ed = [...existing.education_ids].sort().join("\0")
    const sk = [...existing.skill_ids].sort().join("\0")
    return [
      id,
      existing.updated_at,
      existing.title,
      existing.description,
      existing.role_id,
      we,
      ce,
      ed,
      sk,
    ].join("|")
  }, [id, existing])

  React.useEffect(() => {
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
    if (!existing) return
    setTitle(existing.title)
    setDescription(existing.description)
    setRoleId(existing.role_id)
    setWorkExperienceIds([...existing.work_experience_ids])
    setCertificationIds([...existing.certification_ids])
    setEducationIds([...existing.education_ids])
    setSkillIds([...existing.skill_ids])
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `resumeHydrateKey` reflete `existing`; evita re-hidratar só por nova referência no contexto
  }, [id, resumeHydrateKey])

  React.useEffect(() => {
    if (roleId !== "" && roles.length > 0 && !roles.some((r) => r.id === roleId)) {
      setRoleId("")
    }
  }, [roles, roleId])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/resumes", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (roles.length > 0 && !(roleId !== "" && roles.some((r) => r.id === roleId))) {
      return
    }
    const validWe = new Set(work_experiences.map((w) => w.id))
    const validCert = new Set(certifications.map((c) => c.id))
    const validEdu = new Set(education.map((ed) => ed.id))
    const validSk = new Set(skills.map((s) => s.id))
    const updated_at = todayIsoDate()
    const payload = {
      title: title.trim(),
      description: description.trim(),
      updated_at,
      role_id: roles.some((r) => r.id === roleId) ? roleId : "",
      work_experience_ids: workExperienceIds.filter((wid) => validWe.has(wid)),
      certification_ids: certificationIds.filter((cid) => validCert.has(cid)),
      education_ids: educationIds.filter((eid) => validEdu.has(eid)),
      skill_ids: skillIds.filter((sid) => validSk.has(sid)),
    }
    if (isEdit && id) {
      updateResume(id, payload)
    } else {
      addResume(payload)
    }
    navigate("/resumes")
  }

  if (isEdit && !existing) {
    return null
  }

  const pageTitle = isEdit ? "Edit resume" : "New resume"
  const crumbAction = isEdit ? "Edit" : "New"

  const workExperienceRows = work_experiences.map((w) => ({
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
    roles.length === 0 ||
    (roleId !== "" && roles.some((r) => r.id === roleId))
  const canSave = hasValidRole

  const aiContext = React.useMemo((): ResumeDescriptionAiContext => {
    const roleName = roleId ? roles.find((r) => r.id === roleId)?.name ?? null : null
    const workExperienceSummaries = workExperienceIds
      .map((wid) => work_experiences.find((w) => w.id === wid))
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
    roleId,
    roles,
    workExperienceIds,
    work_experiences,
    certificationIds,
    certifications,
    educationIds,
    education,
    skillIds,
    skills,
    description,
  ])

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
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update this saved resume. Link one role and any number of experiences, certifications, education rows, and skills."
                : "Create a resume: pick the target role, then attach supporting records."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                      value={roleId === "" ? undefined : roleId}
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
                  <FieldDescription>
                    Exactly one role per resume. Experiences, certifications, education, and skills
                    are optional multi-selects.
                  </FieldDescription>
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
                {isEdit ? "Save changes" : "Save"}
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
    </AppLayout>
  )
}
