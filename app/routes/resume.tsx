"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate, useParams } from "react-router"

import { QuickAddRoleDialog } from "~/components/opportunities/quick-add/quick-add-role-dialog"
import { QuickAddCertificationDialog } from "~/components/resume/quick-add-certification-dialog"
import { QuickAddEducationDialog } from "~/components/resume/quick-add-education-dialog"
import { QuickAddSkillDialog } from "~/components/resume/quick-add-skill-dialog"
import { QuickAddWorkExperienceDialog } from "~/components/resume/quick-add-work-experience-dialog"
import { ResumeDescriptionAiDialog } from "~/components/resume/resume-description-ai-dialog"
import { ResumeCompiledDownloadMenu } from "~/components/resumes/resume-compiled-download-menu"
import { ResumeCompileMarkdownDialog } from "~/components/resumes/resume-compile-markdown-dialog"
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
  type ApiResume,
} from "~/lib/api/resources/resumes"
import type { ApiSkill } from "~/lib/api/resources/skills"
import { listSkills } from "~/lib/api/resources/skills"
import type { ApiWorkExperience } from "~/lib/api/resources/work-experiences"
import { listWorkExperiences } from "~/lib/api/resources/work-experiences"
import { apiRoleToRole } from "~/lib/opportunity-api-mappers"
import {
  CheckIcon,
  Loader2Icon,
  PlusIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"
import { pagesI18nNs } from "~/lib/i18n/config"
import {
  RESUME_PREFERRED_LANGUAGE_OPTIONS,
  defaultResumePreferredLanguageForUser,
  normalizeResumePreferredLanguage,
  type ResumePreferredLanguage,
} from "~/lib/resume-preferred-language"
import { useSessionUserStore } from "~/stores/session-user-store"

function apiErrorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const firstField = Object.values(err.fieldErrors).flat()[0]
    if (firstField) return firstField
  }
  return fallback
}

function apiWorkExperienceToWorkExperience(
  w: ApiWorkExperience
): WorkExperience {
  return {
    id: w.id,
    title: w.title,
    description: w.description ?? "",
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
function canonicalRoleIdFromRolesList(
  roles: readonly Role[],
  resumeRoleId: string
): string {
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
  const { t } = useTranslation(pagesI18nNs)
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const userPreferredResumeLang = useSessionUserStore((s) =>
    defaultResumePreferredLanguageForUser(s.user.preferred_language)
  )

  const [roles, setRoles] = React.useState<Role[]>([])
  const [workExperiences, setWorkExperiences] = React.useState<
    WorkExperience[]
  >([])
  const [certifications, setCertifications] = React.useState<Certification[]>(
    []
  )
  const [education, setEducation] = React.useState<Education[]>([])
  const [skills, setSkills] = React.useState<Skill[]>([])

  const [pageStatus, setPageStatus] = React.useState<
    "loading" | "ready" | "error" | "not_found"
  >("loading")
  const [pageError, setPageError] = React.useState<string | null>(null)

  const [editDocument, setEditDocument] = React.useState<ResumeDocument | null>(
    null
  )

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [preferredLanguage, setPreferredLanguage] =
    React.useState<ResumePreferredLanguage>(() =>
      defaultResumePreferredLanguageForUser(
        useSessionUserStore.getState().user.preferred_language
      )
    )
  const [workExperienceIds, setWorkExperienceIds] = React.useState<string[]>([])
  const [certificationIds, setCertificationIds] = React.useState<string[]>([])
  const [educationIds, setEducationIds] = React.useState<string[]>([])
  const [skillIds, setSkillIds] = React.useState<string[]>([])
  const [aiDialogOpen, setAiDialogOpen] = React.useState(false)
  const [postSaveOpen, setPostSaveOpen] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [retryNonce, setRetryNonce] = React.useState(0)

  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false)
  const [weDialogOpen, setWeDialogOpen] = React.useState(false)
  const [certDialogOpen, setCertDialogOpen] = React.useState(false)
  const [eduDialogOpen, setEduDialogOpen] = React.useState(false)
  const [skillDialogOpen, setSkillDialogOpen] = React.useState(false)
  const [compileDialogOpen, setCompileDialogOpen] = React.useState(false)
  const [compileAutoStart, setCompileAutoStart] = React.useState(false)

  const handleResumeMarkdownCompiled = React.useCallback(
    (api: ApiResume) => {
      setEditDocument((prev) =>
        prev
          ? { ...prev, compiled_markdown: api.compiled_markdown ?? null }
          : prev
      )
      navigate("/resumes")
    },
    [navigate]
  )

  const reloadReferenceLists = React.useCallback(async () => {
    const [rolesApi, weApi, certApi, eduApi, skApi] = await Promise.all([
      listRoles({ paginated: false }),
      listWorkExperiences({ paginated: false }),
      listCertifications({ paginated: false }),
      listEducations({ paginated: false }),
      listSkills({ paginated: false }),
    ])
    setRoles(rolesApi.map(apiRoleToRole))
    setWorkExperiences(weApi.map(apiWorkExperienceToWorkExperience))
    setCertifications(certApi.map(apiCertificationToCertification))
    setEducation(eduApi.map(apiEducationToEducation))
    setSkills(skApi.map(apiSkillToSkill))
  }, [])

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      setPageStatus("loading")
      setPageError(null)
      setEditDocument(null)

      if (!id) {
        setTitle("")
        setDescription("")
        setRoleId("")
        setPreferredLanguage(
          defaultResumePreferredLanguageForUser(
            useSessionUserStore.getState().user.preferred_language
          )
        )
        setWorkExperienceIds([])
        setCertificationIds([])
        setEducationIds([])
        setSkillIds([])
        try {
          await reloadReferenceLists()
          if (!cancelled) setPageStatus("ready")
        } catch (e) {
          if (!cancelled) {
            setPageStatus("error")
            setPageError(apiErrorText(e, t("resume.load_error_data")))
          }
        }
        return
      }

      try {
        await reloadReferenceLists()
        if (cancelled) return
        const api = await getResume(id)
        if (cancelled) return
        const doc = apiResumeToResumeDocument(api)
        setEditDocument(doc)
        setTitle(doc.title)
        setDescription(doc.description)
        setPreferredLanguage(
          normalizeResumePreferredLanguage(doc.preferred_language)
        )
        setRoleId(doc.role_id ?? "")
        setWorkExperienceIds([...doc.work_experience_ids])
        setCertificationIds([...doc.certification_ids])
        setEducationIds([...doc.education_ids])
        setSkillIds([...doc.skill_ids])
        setPageStatus("ready")
      } catch (e) {
        if (!cancelled) {
          if (e instanceof ApiError && e.status === 404) {
            setPageStatus("not_found")
          } else {
            setPageStatus("error")
            setPageError(apiErrorText(e, t("resume.load_error_data")))
          }
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id, retryNonce, reloadReferenceLists, t])

  React.useEffect(() => {
    if (id) return
    if (pageStatus !== "ready") return
    setPreferredLanguage(userPreferredResumeLang)
  }, [id, pageStatus, userPreferredResumeLang])

  const rolesIdSignature = React.useMemo(
    () =>
      roles
        .map((r) => r.id)
        .sort()
        .join("\0"),
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

  function resetForm() {
    setTitle("")
    setDescription("")
    setRoleId("")
    setPreferredLanguage(
      defaultResumePreferredLanguageForUser(
        useSessionUserStore.getState().user.preferred_language
      )
    )
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
      role_id: roles.length === 0 ? "" : resolvedSelectRoleId,
      preferred_language: preferredLanguage,
    }

    setSaving(true)
    try {
      if (isEdit && id) {
        await updateResumeApi(id, corePayload)
        await syncResumeRelations(id, relationPayload)
        setCompileAutoStart(true)
        setCompileDialogOpen(true)
      } else {
        const created = await createResumeApi(corePayload)
        await syncResumeRelations(created.id, relationPayload)
        setPostSaveOpen(true)
      }
    } catch (err) {
      setSaveError(apiErrorText(err, t("resume.save_error")))
    } finally {
      setSaving(false)
    }
  }

  const pageTitle = isEdit ? t("resume.edit_title") : t("resume.new_title")
  const crumbAction = isEdit ? t("shared.crumb_edit") : t("shared.crumb_new")

  const workExperienceRows = workExperiences.map((w) => ({
    id: w.id,
    primary: w.title,
    secondary: w.company_name,
  }))
  const certificationRows = certifications.map((c) => ({
    id: c.id,
    primary: c.name,
    secondary:
      c.date_from && c.date_to ? `${c.date_from} → ${c.date_to}` : undefined,
  }))
  const educationRows = education.map((ed) => ({
    id: ed.id,
    primary: ed.institution_name,
    secondary: `${ed.degree} — ${ed.field_of_study}`,
  }))

  const hasValidRole = roles.length === 0 || resolvedSelectRoleId !== ""
  const canSave = hasValidRole && !saving

  const aiContext = React.useMemo((): ResumeDescriptionAiContext => {
    const roleName = resolvedSelectRoleId
      ? (roles.find((r) => r.id === resolvedSelectRoleId)?.name ?? null)
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
      preferredLanguage,
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
    preferredLanguage,
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
          { label: tc("breadcrumb_dashboard"), to: "/dashboard" },
          { label: tc("nav_resumes"), to: "/resumes" },
          { label: crumbAction },
        ]}
      >
        <p className="py-12 text-center text-sm text-muted-foreground">
          {t("resume.loading")}
        </p>
      </AppLayout>
    )
  }

  if (pageStatus === "error") {
    return (
      <AppLayout
        title={pageTitle}
        breadcrumbs={[
          { label: tc("breadcrumb_dashboard"), to: "/dashboard" },
          { label: tc("nav_resumes"), to: "/resumes" },
          { label: crumbAction },
        ]}
      >
        <p className="px-1 text-sm text-destructive" role="alert">
          {pageError ?? t("resume.something_wrong")}{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 align-baseline text-destructive underline"
            onClick={() => setRetryNonce((n) => n + 1)}
          >
            {t("shared.retry")}
          </Button>
        </p>
      </AppLayout>
    )
  }

  if (pageStatus === "not_found") {
    return (
      <AppLayout
        title={t("resume.not_found_title")}
        breadcrumbs={[
          { label: tc("breadcrumb_dashboard"), to: "/dashboard" },
          { label: tc("nav_resumes"), to: "/resumes" },
          { label: t("shared.crumb_not_found") },
        ]}
      >
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>{t("resume.not_found_title")}</CardTitle>
            <CardDescription>{t("resume.not_found_body")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/resumes">{t("resume.back_to_list")}</Link>
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
        { label: tc("breadcrumb_dashboard"), to: "/dashboard" },
        { label: tc("nav_resumes"), to: "/resumes" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {saveError ? (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {saveError}
          </p>
        ) : null}
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit ? t("resume.card_desc_edit") : t("resume.card_desc_new")}
            </CardDescription>
          </CardHeader>
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="flex flex-col gap-4"
          >
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="resume-preferred-lang">
                    {t("resume.field_preferred_language")}
                  </FieldLabel>
                  <Select
                    key={`resume-preferred-lang-${id ?? "new"}`}
                    value={normalizeResumePreferredLanguage(preferredLanguage)}
                    onValueChange={(v) =>
                      setPreferredLanguage(v as ResumePreferredLanguage)
                    }
                    disabled={saving}
                  >
                    <SelectTrigger
                      id="resume-preferred-lang"
                      className="w-full"
                    >
                      <SelectValue
                        placeholder={t("resume.placeholder_preferred_language")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {RESUME_PREFERRED_LANGUAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {t(`resume.output_lang.${opt.value}`)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {t("resume.preferred_language_hint")}
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="resume-title">
                    {t("shared.title")}
                  </FieldLabel>
                  <Input
                    id="resume-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t("resume.title_placeholder")}
                    required
                  />
                </Field>
                <Field>
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <FieldLabel htmlFor="resume-desc" className="mb-0">
                      {t("shared.description")}
                    </FieldLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAiDialogOpen(true)}
                    >
                      <SparklesIcon data-icon="inline-start" />
                      {t("resume.generate_ai")}
                    </Button>
                  </div>
                  <Textarea
                    id="resume-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("resume.description_placeholder")}
                    required
                    rows={4}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="resume-role">
                    {t("shared.role")}
                  </FieldLabel>
                  <div className="flex min-w-0 flex-row items-stretch gap-2">
                    {roles.length > 0 ? (
                      <Select
                        key={`${id ?? "new"}-${rolesIdSignature}`}
                        value={
                          resolvedSelectRoleId === ""
                            ? undefined
                            : resolvedSelectRoleId
                        }
                        onValueChange={setRoleId}
                        required
                      >
                        <SelectTrigger
                          id="resume-role"
                          className="w-full min-w-0 flex-1"
                        >
                          <SelectValue
                            placeholder={t("resume.role_placeholder")}
                          />
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
                        className="flex min-h-8 flex-1 items-center text-sm text-muted-foreground"
                      >
                        {t("resume.no_roles")}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      aria-label={t("roles.add")}
                      onClick={() => setRoleDialogOpen(true)}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                  {roles.length === 0 ? (
                    <FieldDescription>
                      {t("resume.role_hint_empty")}
                    </FieldDescription>
                  ) : null}
                  {roles.length > 0 && !hasValidRole ? (
                    <FieldDescription className="text-destructive">
                      {t("resume.role_hint_required")}
                    </FieldDescription>
                  ) : null}
                </Field>
              </FieldGroup>

              <div className="mt-6 flex flex-col gap-6">
                <ResumeLinkedMultiFieldset
                  idPrefix="resume-we"
                  legend={t("resume.legend_work")}
                  description={t("resume.work_desc")}
                  rows={workExperienceRows}
                  selectedIds={workExperienceIds}
                  onSelectedIdsChange={setWorkExperienceIds}
                  emptyMessage={t("resume.work_empty")}
                  emptyHint={t("resume.work_hint")}
                  onAddNew={() => setWeDialogOpen(true)}
                  addNewAriaLabel={t("resume.aria_add_work")}
                />
                <ResumeLinkedMultiFieldset
                  idPrefix="resume-cert"
                  legend={t("resume.legend_cert")}
                  description={t("resume.cert_desc")}
                  rows={certificationRows}
                  selectedIds={certificationIds}
                  onSelectedIdsChange={setCertificationIds}
                  emptyMessage={t("resume.cert_empty")}
                  emptyHint={t("resume.cert_hint")}
                  onAddNew={() => setCertDialogOpen(true)}
                  addNewAriaLabel={t("resume.aria_add_cert")}
                />
                <ResumeLinkedMultiFieldset
                  idPrefix="resume-edu"
                  legend={t("resume.legend_edu")}
                  description={t("resume.edu_desc")}
                  rows={educationRows}
                  selectedIds={educationIds}
                  onSelectedIdsChange={setEducationIds}
                  emptyMessage={t("resume.edu_empty")}
                  emptyHint={t("resume.edu_hint")}
                  onAddNew={() => setEduDialogOpen(true)}
                  addNewAriaLabel={t("resume.aria_add_edu")}
                />
                <WorkExperienceSkillFieldset
                  idPrefix="resume-skills"
                  skills={skills}
                  skillIds={skillIds}
                  onSkillIdsChange={setSkillIds}
                  emptyMessage={t("resume.skills_empty")}
                  emptyHint={t("resume.skills_hint")}
                  onAddNew={() => setSkillDialogOpen(true)}
                  addNewAriaLabel={t("resume.aria_add_skill")}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="max-sm:size-9 max-sm:min-h-9 max-sm:min-w-9 max-sm:justify-center max-sm:gap-0 max-sm:!px-0 max-sm:!ps-0 max-sm:!pe-0"
                aria-label={t("resume.cancel_aria")}
                onClick={() => navigate(-1)}
              >
                <XIcon className="size-4 shrink-0 sm:hidden" aria-hidden />
                <span className="max-sm:sr-only">{t("shared.cancel")}</span>
              </Button>
              {isEdit && id ? (
                <ResumeCompiledDownloadMenu
                  resumeId={id}
                  resumeTitle={title.trim() || t("resume.untitled_resume")}
                  compiledMarkdown={editDocument?.compiled_markdown}
                />
              ) : null}
              <Button
                type="submit"
                size="sm"
                className="max-sm:size-9 max-sm:min-h-9 max-sm:min-w-9 max-sm:justify-center max-sm:gap-0 max-sm:!px-0 max-sm:!ps-0 max-sm:!pe-0"
                aria-label={
                  isEdit
                    ? t("resume.save_aria_edit")
                    : t("resume.save_aria_new")
                }
                disabled={!canSave}
              >
                {saving ? (
                  <>
                    <Loader2Icon
                      className="size-4 shrink-0 animate-spin"
                      aria-hidden
                    />
                    <span className="max-sm:sr-only">
                      {t("resume.saving_sr")}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckIcon
                      className="size-4 shrink-0 sm:hidden"
                      aria-hidden
                    />
                    <span className="max-sm:sr-only">
                      {isEdit ? t("shared.save_changes") : t("shared.save")}
                    </span>
                  </>
                )}
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
        {isEdit && id ? (
          <ResumeCompileMarkdownDialog
            open={compileDialogOpen}
            onOpenChange={(next) => {
              setCompileDialogOpen(next)
              if (!next) setCompileAutoStart(false)
            }}
            resumeId={id}
            resumeTitle={title || t("resume.untitled_resume")}
            autoStart={compileAutoStart}
            onCompiled={handleResumeMarkdownCompiled}
          />
        ) : null}
        <QuickAddRoleDialog
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          persistViaApi
          onAdded={(newId) => {
            setRoleId(newId)
          }}
          onPersistedViaApi={() => reloadReferenceLists()}
        />
        <QuickAddWorkExperienceDialog
          open={weDialogOpen}
          onOpenChange={setWeDialogOpen}
          skills={skills}
          onEmptySkillsAddNew={() => setSkillDialogOpen(true)}
          emptySkillsMessage={t("resume.we_empty_skills")}
          emptySkillsHint={t("resume.we_empty_skills_hint")}
          onAdded={(newId) => {
            setWorkExperienceIds((prev) =>
              prev.includes(newId) ? prev : [...prev, newId]
            )
          }}
          onPersistedViaApi={() => reloadReferenceLists()}
        />
        <QuickAddCertificationDialog
          open={certDialogOpen}
          onOpenChange={setCertDialogOpen}
          onAdded={(newId) => {
            setCertificationIds((prev) =>
              prev.includes(newId) ? prev : [...prev, newId]
            )
          }}
          onPersistedViaApi={() => reloadReferenceLists()}
        />
        <QuickAddEducationDialog
          open={eduDialogOpen}
          onOpenChange={setEduDialogOpen}
          onAdded={(newId) => {
            setEducationIds((prev) =>
              prev.includes(newId) ? prev : [...prev, newId]
            )
          }}
          onPersistedViaApi={() => reloadReferenceLists()}
        />
        <QuickAddSkillDialog
          open={skillDialogOpen}
          onOpenChange={setSkillDialogOpen}
          onAdded={(newId) => {
            setSkillIds((prev) =>
              prev.includes(newId) ? prev : [...prev, newId]
            )
          }}
          onPersistedViaApi={() => reloadReferenceLists()}
        />
      </div>
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel={t("entity.resume")}
        onGoToList={() => navigate("/resumes")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
