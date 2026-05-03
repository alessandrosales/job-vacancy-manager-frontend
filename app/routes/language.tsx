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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"
import { ApiError } from "~/lib/api/errors"
import {
  createLanguage,
  getLanguage,
  updateLanguage,
  type LanguageLevel,
} from "~/lib/api/resources/languages"

const LEVEL_OPTIONS: { value: LanguageLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "native", label: "Native" },
]

function formErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.name ?? []),
      ...(err.fieldErrors.level ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts[0] ?? "Could not save language."
  }
  return "Could not save language."
}

export default function LanguagePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [name, setName] = React.useState("")
  const [level, setLevel] = React.useState<LanguageLevel>("intermediate")
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
    void getLanguage(id)
      .then((row) => {
        if (cancelled) return
        setName(row.name)
        setLevel(row.level)
        setLoadState("idle")
      })
      .catch(() => {
        if (!cancelled) navigate("/languages", { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, id, navigate])

  function resetForm() {
    setName("")
    setLevel("intermediate")
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    setFormError(null)
    const nameTrim = name.trim()

    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateLanguage(id, {
          name: nameTrim,
          level,
        })
        navigate("/languages")
      } else {
        await createLanguage({
          name: nameTrim,
          level,
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
        title="Edit language"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Languages", to: "/languages" },
          { label: "Edit" },
        ]}
      >
        <p className="text-muted-foreground">Loading language…</p>
      </AppLayout>
    )
  }

  const pageTitle = isEdit ? "Edit language" : "New language"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={pageTitle}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Languages", to: "/languages" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update this spoken language and proficiency level."
                : "Add a language you speak for your profile."}
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
                  <FieldLabel htmlFor="lang-name">Name</FieldLabel>
                  <Input
                    id="lang-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. English, Portuguese"
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lang-level">Proficiency</FieldLabel>
                  <Select
                    value={level}
                    onValueChange={(v) => setLevel(v as LanguageLevel)}
                    disabled={submitting}
                  >
                    <SelectTrigger id="lang-level" className="w-full">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {LEVEL_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
                {submitting ? "Saving…" : isEdit ? "Save changes" : "Save"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel="Language"
        onGoToList={() => navigate("/languages")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
