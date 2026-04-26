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

export default function SkillPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { skills, addSkill, updateSkill } = useAppData()
  const existing = id ? skills.find((s) => s.id === id) : undefined

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  React.useEffect(() => {
    if (existing) {
      setName(existing.name)
      setDescription(existing.description)
    }
  }, [existing])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/skills", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: name.trim(),
      description: description.trim(),
    }
    if (isEdit && id) {
      updateSkill(id, payload)
    } else {
      addSkill(payload)
    }
    navigate("/skills")
  }

  if (isEdit && !existing) {
    return null
  }

  const title = isEdit ? "Edit skill" : "New skill"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={title}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Skills", to: "/skills" },
        { label: crumbAction },
      ]}
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update this skill."
              : "Add a skill to your profile list."}
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="skill-name">Name</FieldLabel>
                <Input
                  id="skill-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="skill-desc">Description</FieldLabel>
                <Textarea
                  id="skill-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
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
    </AppLayout>
  )
}
