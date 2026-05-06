import * as React from "react"
import { useNavigate, useParams } from "react-router"

import { WorkExperienceSkillFieldset } from "~/components/work-experience/work-experience-skill-fieldset"
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
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"
import { ApiError } from "~/lib/api/errors"
import { listSkills, type ApiSkill } from "~/lib/api/resources/skills"
import {
  createWorkExperience,
  getWorkExperience,
  syncWorkExperienceSkills,
  updateWorkExperience,
} from "~/lib/api/resources/work-experiences"

function emptyToNull(s: string): string | null {
  const t = s.trim()
  return t === "" ? null : t
}

function formErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.title ?? []),
      ...(err.fieldErrors.company_name ?? []),
      ...(err.fieldErrors.is_remote ?? []),
      ...(err.fieldErrors.date_from ?? []),
      ...(err.fieldErrors.date_to ?? []),
      ...(err.fieldErrors.description ?? []),
      ...(err.fieldErrors.skill_ids ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts[0] ?? "Could not save work experience."
  }
  return "Could not save work experience."
}

export default function WorkExperiencePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [skills, setSkills] = React.useState<ApiSkill[]>([])
  const [skillsLoading, setSkillsLoading] = React.useState(true)

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")
  const [isRemote, setIsRemote] = React.useState(false)
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [skillIds, setSkillIds] = React.useState<string[]>([])
  const [postSaveOpen, setPostSaveOpen] = React.useState(false)
  const [loadState, setLoadState] = React.useState<"idle" | "loading">(
    isEdit ? "loading" : "idle"
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setSkillsLoading(true)
    void listSkills({ paginated: false })
      .then((rows) => {
        if (!cancelled) setSkills(rows)
      })
      .catch(() => {
        if (!cancelled) setSkills([])
      })
      .finally(() => {
        if (!cancelled) setSkillsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (!isEdit || !id) {
      setLoadState("idle")
      return
    }

    let cancelled = false
    setLoadState("loading")
    void getWorkExperience(id)
      .then((row) => {
        if (cancelled) return
        setTitle(row.title)
        setDescription(row.description ?? "")
        setCompanyName(row.company_name)
        setIsRemote(row.is_remote)
        setDateFrom(row.date_from ?? "")
        setDateTo(row.date_to ?? "")
        setSkillIds([...(row.skill_ids ?? [])])
        setLoadState("idle")
      })
      .catch(() => {
        if (!cancelled) navigate("/work-experiences", { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, id, navigate])

  function resetForm() {
    setTitle("")
    setDescription("")
    setCompanyName("")
    setIsRemote(false)
    setDateFrom("")
    setDateTo("")
    setSkillIds([])
    setFormError(null)
  }

  function validSkillIds(): string[] {
    const allowed = new Set(skills.map((s) => s.id))
    return skillIds.filter((sid) => allowed.has(sid))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    setFormError(null)

    const payload = {
      title: title.trim(),
      description: emptyToNull(description),
      company_name: companyName.trim(),
      is_remote: isRemote,
      date_from: emptyToNull(dateFrom),
      date_to: emptyToNull(dateTo),
    }

    const ids = validSkillIds()

    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateWorkExperience(id, payload)
        await syncWorkExperienceSkills(id, ids)
        navigate("/work-experiences")
      } else {
        const row = await createWorkExperience(payload)
        await syncWorkExperienceSkills(row.id, ids)
        setPostSaveOpen(true)
      }
    } catch (err) {
      setFormError(formErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (isEdit && loadState === "loading") {
    return (
      <AppLayout
        title="Edit work experience"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Work experience", to: "/work-experiences" },
          { label: "Edit" },
        ]}
      >
        <p className="text-muted-foreground">Loading work experience…</p>
      </AppLayout>
    )
  }

  const pageTitle = isEdit ? "Edit work experience" : "New work experience"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={pageTitle}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Work experience", to: "/work-experiences" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update this position in your history."
                : "Add a role or employer you want on your CV."}
            </CardDescription>
          </CardHeader>
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="flex flex-col gap-4"
          >
            <CardContent>
              <FieldGroup>
                {formError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {formError}
                  </p>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="we-title">Title</FieldLabel>
                  <Input
                    id="we-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="we-company">Company name</FieldLabel>
                  <Input
                    id="we-company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="we-description">Description</FieldLabel>
                  <Textarea
                    id="we-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Responsibilities, scope, or achievements for this role…"
                    disabled={submitting}
                    rows={5}
                    className="min-h-[120px] resize-y"
                  />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="we-remote">Remote</FieldLabel>
                  <Switch
                    id="we-remote"
                    checked={isRemote}
                    onCheckedChange={(v) => setIsRemote(Boolean(v))}
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="we-from">Date from</FieldLabel>
                  <Input
                    id="we-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="we-to">Date to</FieldLabel>
                  <Input
                    id="we-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    disabled={submitting}
                  />
                </Field>
                {skillsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading skills…</p>
                ) : (
                  <WorkExperienceSkillFieldset
                    idPrefix="we-page"
                    skills={skills}
                    skillIds={skillIds}
                    onSkillIdsChange={setSkillIds}
                  />
                )}
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || skillsLoading}>
                {submitting
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Save"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel="Work experience"
        onGoToList={() => navigate("/work-experiences")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
