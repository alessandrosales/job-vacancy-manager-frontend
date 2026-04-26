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
import { PostSaveDialog } from "~/components/shared/post-save-dialog"

export default function CertificationPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { certifications, addCertification, updateCertification } = useAppData()
  const existing = id ? certifications.find((c) => c.id === id) : undefined

  const [name, setName] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [postSaveOpen, setPostSaveOpen] = React.useState(false)

  React.useEffect(() => {
    if (existing) {
      setName(existing.name)
      setDateFrom(existing.date_from)
      setDateTo(existing.date_to)
    }
  }, [existing])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/certifications", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function resetForm() {
    setName("")
    setDateFrom("")
    setDateTo("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: name.trim(),
      date_from: dateFrom.trim(),
      date_to: dateTo.trim(),
    }
    if (isEdit && id) {
      updateCertification(id, payload)
      navigate("/certifications")
    } else {
      addCertification(payload)
      setPostSaveOpen(true)
    }
  }

  if (isEdit && !existing) {
    return null
  }

  const pageTitle = isEdit ? "Edit certification" : "New certification"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={pageTitle}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Certifications", to: "/certifications" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update this certification."
                : "Add a certification or license you hold."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="cert-name">Name</FieldLabel>
                  <Input
                    id="cert-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cert-from">Date from</FieldLabel>
                  <Input
                    id="cert-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cert-to">Date to</FieldLabel>
                  <Input
                    id="cert-to"
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
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel="Certification"
        onGoToList={() => navigate("/certifications")}
        onAddAnother={() => { setPostSaveOpen(false); resetForm() }}
      />
    </AppLayout>
  )
}
