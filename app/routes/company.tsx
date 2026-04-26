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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import type { InterestLevel } from "~/lib/labels"
import { INTEREST_LEVEL_OPTIONS } from "~/lib/labels"

export default function CompanyPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { companies, addCompany, updateCompany } = useAppData()
  const existing = id ? companies.find((c) => c.id === id) : undefined

  const [name, setName] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>("Medium")

  React.useEffect(() => {
    if (existing) {
      setName(existing.name)
      setUrl(existing.url)
      setDescription(existing.description)
      setInterestLevel(existing.interestLevel)
    }
  }, [existing])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/companies", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      name: name.trim(),
      url: url.trim(),
      description: description.trim(),
      interestLevel,
    }
    if (isEdit && id) {
      updateCompany(id, payload)
    } else {
      addCompany(payload)
    }
    navigate("/companies")
  }

  if (isEdit && !existing) {
    return null
  }

  const title = isEdit ? "Edit company" : "New company"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={title}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Companies", to: "/companies" },
        { label: crumbAction },
      ]}
    >
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update this company."
              : "Add a company you want to track."}
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="co-name">Name</FieldLabel>
                <Input
                  id="co-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="co-url">URL</FieldLabel>
                <Input
                  id="co-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="co-desc">Description</FieldLabel>
                <Textarea
                  id="co-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="co-interest">Interest level</FieldLabel>
                <Select
                  value={interestLevel}
                  onValueChange={(v) => setInterestLevel(v as InterestLevel)}
                >
                  <SelectTrigger id="co-interest" className="w-full min-w-0">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {INTEREST_LEVEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
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
            <Button type="submit">
              {isEdit ? "Save changes" : "Save"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AppLayout>
  )
}
