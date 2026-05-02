import * as React from "react"
import { useNavigate, useParams } from "react-router"

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
import { InterestLevelStarPicker } from "~/components/shared/interest-level-star-picker"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"
import { ApiError } from "~/lib/api/errors"
import {
  createRole,
  getRole,
  updateRole,
} from "~/lib/api/resources/roles"
import type { InterestLevel } from "~/lib/labels"

function formErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.name ?? []),
      ...(err.fieldErrors.description ?? []),
      ...(err.fieldErrors.interest_level ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts[0] ?? "Could not save role."
  }
  return "Could not save role."
}

export default function RolePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(3)
  const [postSaveOpen, setPostSaveOpen] = React.useState(false)
  const [loadState, setLoadState] = React.useState<"idle" | "loading">(
    isEdit ? "loading" : "idle"
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isEdit || !id) {
      setLoadState("idle")
      return
    }

    let cancelled = false
    setLoadState("loading")
    void getRole(id)
      .then((role) => {
        if (cancelled) return
        setName(role.name)
        setDescription(role.description ?? "")
        setInterestLevel(role.interest_level as InterestLevel)
        setLoadState("idle")
      })
      .catch(() => {
        if (!cancelled) navigate("/roles", { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, id, navigate])

  function resetForm() {
    setName("")
    setDescription("")
    setInterestLevel(3)
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    setFormError(null)
    const nameTrim = name.trim()
    const descriptionValue = description.trim() === "" ? null : description.trim()

    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateRole(id, {
          name: nameTrim,
          description: descriptionValue,
          interest_level: interestLevel,
        })
        navigate("/roles")
      } else {
        await createRole({
          name: nameTrim,
          description: descriptionValue,
          interest_level: interestLevel,
        })
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
        title="Edit role"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Roles", to: "/roles" },
          { label: "Edit" },
        ]}
      >
        <p className="text-muted-foreground">Loading role…</p>
      </AppLayout>
    )
  }

  const title = isEdit ? "Edit role" : "New role"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={title}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Roles", to: "/roles" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update this role."
                : "Add a job role you care about."}
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
                  <FieldLabel htmlFor="role-name">Name</FieldLabel>
                  <Input
                    id="role-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="role-desc">Description</FieldLabel>
                  <Textarea
                    id="role-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    disabled={submitting}
                    placeholder="Optional"
                  />
                </Field>
                <Field>
                  <FieldLabel>Interest level</FieldLabel>
                  <div
                    className={
                      submitting ? "pointer-events-none opacity-60" : undefined
                    }
                  >
                    <InterestLevelStarPicker
                      value={interestLevel}
                      onChange={setInterestLevel}
                    />
                  </div>
                </Field>
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
              <Button type="submit" disabled={submitting}>
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
        entityLabel="Role"
        onGoToList={() => navigate("/roles")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
