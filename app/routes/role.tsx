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
import { InterestLevelStarPicker } from "~/components/shared/interest-level-star-picker"
import type { InterestLevel } from "~/lib/labels"

export default function RolePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { roles, addRole, updateRole } = useAppData()
  const existing = id ? roles.find((r) => r.id === id) : undefined

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(3)

  React.useEffect(() => {
    if (existing) {
      setName(existing.name)
      setDescription(existing.description)
      setInterestLevel(existing.interest_level)
    }
  }, [existing])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/roles", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: name.trim(),
      description: description.trim(),
      interest_level: interestLevel,
    }
    if (isEdit && id) {
      updateRole(id, payload)
    } else {
      addRole(payload)
    }
    navigate("/roles")
  }

  if (isEdit && !existing) {
    return null
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
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="role-name">Name</FieldLabel>
                <Input
                  id="role-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="role-desc">Description</FieldLabel>
                <Textarea
                  id="role-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                />
              </Field>
              <Field>
                <FieldLabel>Interest level</FieldLabel>
                <InterestLevelStarPicker
                  value={interestLevel}
                  onChange={setInterestLevel}
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
    </AppLayout>
  )
}
