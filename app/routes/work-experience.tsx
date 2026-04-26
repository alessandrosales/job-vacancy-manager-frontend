import * as React from "react"
import { useNavigate, useParams } from "react-router"

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
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"

export default function WorkExperiencePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const {
    work_experiences,
    skills,
    addWorkExperience,
    updateWorkExperience,
  } = useAppData()
  const existing = id ? work_experiences.find((w) => w.id === id) : undefined

  const [title, setTitle] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")
  const [isRemote, setIsRemote] = React.useState(false)
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [skillIds, setSkillIds] = React.useState<string[]>([])

  React.useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setCompanyName(existing.company_name)
      setIsRemote(existing.is_remote)
      setDateFrom(existing.date_from)
      setDateTo(existing.date_to)
      setSkillIds([...existing.skill_ids])
    }
  }, [existing])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/work-experiences", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      title: title.trim(),
      company_name: companyName.trim(),
      is_remote: isRemote,
      date_from: dateFrom.trim(),
      date_to: dateTo.trim(),
      skill_ids: skillIds.filter((sid) => skills.some((s) => s.id === sid)),
    }
    if (isEdit && id) {
      updateWorkExperience(id, payload)
    } else {
      addWorkExperience(payload)
    }
    navigate("/work-experiences")
  }

  if (isEdit && !existing) {
    return null
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="we-title">Title</FieldLabel>
                  <Input
                    id="we-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="we-company">Company name</FieldLabel>
                  <Input
                    id="we-company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </Field>
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="we-remote">Remote</FieldLabel>
                  <Switch
                    id="we-remote"
                    checked={isRemote}
                    onCheckedChange={(v) => setIsRemote(Boolean(v))}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="we-from">Date from</FieldLabel>
                  <Input
                    id="we-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="we-to">Date to</FieldLabel>
                  <Input
                    id="we-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </Field>
                <WorkExperienceSkillFieldset
                  idPrefix="we-page"
                  skills={skills}
                  skillIds={skillIds}
                  onSkillIdsChange={setSkillIds}
                />
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">{isEdit ? "Save changes" : "Save"}</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  )
}
