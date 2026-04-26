import * as React from "react"
import { useNavigate, useParams } from "react-router"

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

export default function EducationPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { education, addEducation, updateEducation } = useAppData()
  const existing = id ? education.find((e) => e.id === id) : undefined

  const [institutionName, setInstitutionName] = React.useState("")
  const [degree, setDegree] = React.useState("")
  const [fieldOfStudy, setFieldOfStudy] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")

  React.useEffect(() => {
    if (existing) {
      setInstitutionName(existing.institution_name)
      setDegree(existing.degree)
      setFieldOfStudy(existing.field_of_study)
      setDateFrom(existing.date_from)
      setDateTo(existing.date_to)
    }
  }, [existing])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/educations", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      institution_name: institutionName.trim(),
      degree: degree.trim(),
      field_of_study: fieldOfStudy.trim(),
      date_from: dateFrom.trim(),
      date_to: dateTo.trim(),
    }
    if (isEdit && id) {
      updateEducation(id, payload)
    } else {
      addEducation(payload)
    }
    navigate("/educations")
  }

  if (isEdit && !existing) {
    return null
  }

  const pageTitle = isEdit ? "Edit education" : "New education"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={pageTitle}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Education", to: "/educations" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update this academic entry."
                : "Add a degree or program you completed."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="edu-inst">Institution name</FieldLabel>
                  <Input
                    id="edu-inst"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-degree">Degree</FieldLabel>
                  <Input
                    id="edu-degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-field">Field of study</FieldLabel>
                  <Input
                    id="edu-field"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-from">Date from</FieldLabel>
                  <Input
                    id="edu-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-to">Date to</FieldLabel>
                  <Input
                    id="edu-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </Field>
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
