import * as React from "react"
import { useNavigate, useParams } from "react-router"

import { useAppData } from "~/components/providers/app-data-provider"
import { InterestLevelStarPicker } from "~/components/interest-level-star-picker"
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
import { DEFAULT_OPPORTUNITY_STATUS_DEFINITIONS } from "~/lib/labels"
import type { InterestLevel, OpportunityStatus } from "~/lib/labels"

export default function OpportunityPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const {
    opportunities,
    addOpportunity,
    updateOpportunity,
    opportunity_statuses: opportunityStatuses,
  } = useAppData()
  const existing = id ? opportunities.find((o) => o.id === id) : undefined
  const defaultStatusId =
    opportunityStatuses[0]?.id ?? DEFAULT_OPPORTUNITY_STATUS_DEFINITIONS[0]!.id

  const [company, setCompany] = React.useState("")
  const [role, setRole] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [status, setStatus] = React.useState<OpportunityStatus>(defaultStatusId)
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(0)

  React.useEffect(() => {
    if (existing) {
      setCompany(existing.company)
      setRole(existing.role)
      setDescription(existing.description)
      setUrl(existing.url)
      setStatus(existing.status)
      setInterestLevel(
        Math.min(5, Math.max(0, Math.round(existing.interest_level))) as InterestLevel
      )
    }
  }, [existing])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/opportunities", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      company: company.trim(),
      role: role.trim(),
      description: description.trim(),
      url: url.trim(),
      status,
      interest_level: interestLevel,
      board_column_id: existing?.board_column_id ?? status,
    }
    if (isEdit && id) {
      updateOpportunity(id, payload)
    } else {
      addOpportunity(payload)
    }
    navigate("/opportunities")
  }

  if (isEdit && !existing) {
    return null
  }

  const title = isEdit ? "Edit opportunity" : "New opportunity"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={title}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Opportunities", to: "/opportunities" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update this job opportunity."
              : "Add a job opportunity to your tracker."}
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="opp-company">Company</FieldLabel>
                <Input
                  id="opp-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="opp-role">Role</FieldLabel>
                <Input
                  id="opp-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="opp-desc">Description</FieldLabel>
                <Textarea
                  id="opp-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="opp-url">URL</FieldLabel>
                <Input
                  id="opp-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="opp-status">Status</FieldLabel>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as OpportunityStatus)}
                >
                  <SelectTrigger id="opp-status" className="w-full min-w-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {opportunityStatuses.map((st) => (
                        <SelectItem key={st.id} value={st.id}>
                          {st.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Interest level</FieldLabel>
                <InterestLevelStarPicker value={interestLevel} onChange={setInterestLevel} />
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
