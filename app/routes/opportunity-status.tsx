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
import { Textarea } from "~/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import type { OpportunityStatusDefinition, StatusBadgeVariant } from "~/lib/labels"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"

const BADGE_VARIANTS: StatusBadgeVariant[] = [
  "secondary",
  "outline",
  "default",
  "destructive",
]

export default function OpportunityStatusPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const {
    opportunity_statuses: opportunityStatuses,
    addOpportunityStatus,
    updateOpportunityStatus,
  } = useAppData()
  const existing = id
    ? opportunityStatuses.find((s) => s.id === id)
    : undefined

  const [label, setLabel] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [variant, setVariant] = React.useState<StatusBadgeVariant>("secondary")
  const [postSaveOpen, setPostSaveOpen] = React.useState(false)

  React.useEffect(() => {
    if (existing) {
      setLabel(existing.label)
      setDescription(existing.description ?? "")
      setVariant(existing.variant)
    }
  }, [existing])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/opportunities/statuses", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function resetForm() {
    setLabel("")
    setDescription("")
    setVariant("secondary")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = label.trim()
    if (!t) return
    const row: Omit<OpportunityStatusDefinition, "id"> = {
      label: t,
      description: description.trim() || undefined,
      variant,
    }
    if (isEdit && id) {
      updateOpportunityStatus(id, row)
      navigate("/opportunities/statuses")
    } else {
      addOpportunityStatus(row)
      setPostSaveOpen(true)
    }
  }

  if (isEdit && !existing) {
    return null
  }

  const title = isEdit ? "Edit status" : "New status"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={title}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Opportunities", to: "/opportunities" },
        { label: "Statuses", to: "/opportunities/statuses" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update the label and badge style. The internal id is fixed so existing opportunities stay linked."
                : "Add a stage to your pipeline. It becomes a column on the Kanban board."}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="os-label">Label</FieldLabel>
                  <Input
                    id="os-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    required
                    placeholder="e.g. Phone screen"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="os-description">Description</FieldLabel>
                  <Textarea
                    id="os-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What does this stage mean? e.g. CV sent, waiting for recruiter reply."
                    rows={3}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="os-variant">Badge style</FieldLabel>
                  <Select
                    value={variant}
                    onValueChange={(v) => setVariant(v as StatusBadgeVariant)}
                  >
                    <SelectTrigger id="os-variant" className="w-full min-w-0">
                      <SelectValue placeholder="Style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {BADGE_VARIANTS.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel="Status"
        onGoToList={() => navigate("/opportunities/statuses")}
        onAddAnother={() => { setPostSaveOpen(false); resetForm() }}
      />
    </AppLayout>
  )
}
