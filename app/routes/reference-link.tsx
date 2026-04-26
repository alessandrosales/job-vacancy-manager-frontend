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

export default function ReferenceLinkPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { reference_links: referenceLinks, addReferenceLink, updateReferenceLink } =
    useAppData()
  const existing = id ? referenceLinks.find((row) => row.id === id) : undefined

  const [title, setTitle] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [postSaveOpen, setPostSaveOpen] = React.useState(false)

  React.useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setUrl(existing.url)
    }
  }, [existing])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/links", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function resetForm() {
    setTitle("")
    setUrl("")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      title: title.trim(),
      url: url.trim(),
    }
    if (isEdit && id) {
      updateReferenceLink(id, payload)
      navigate("/links")
    } else {
      addReferenceLink(payload)
      setPostSaveOpen(true)
    }
  }

  if (isEdit && !existing) {
    return null
  }

  const pageTitle = isEdit ? "Edit link" : "New link"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={pageTitle}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Links", to: "/links" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update this reference link."
                : "Save a title and URL for quick access from your sidebar area."}
            </CardDescription>
          </CardHeader>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="ref-link-title">Title</FieldLabel>
                  <Input
                    id="ref-link-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ref-link-url">URL</FieldLabel>
                  <Input
                    id="ref-link-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://"
                    required
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEdit ? "Save changes" : "Save"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel="Link"
        onGoToList={() => navigate("/links")}
        onAddAnother={() => { setPostSaveOpen(false); resetForm() }}
      />
    </AppLayout>
  )
}
