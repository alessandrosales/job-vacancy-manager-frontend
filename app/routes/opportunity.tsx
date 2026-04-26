import * as React from "react"
import { useNavigate, useParams } from "react-router"

import { OpportunityFormFields } from "~/components/opportunities/opportunity-form-fields"
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
            <OpportunityFormFields
              idPrefix="opp-page"
              company={company}
              onCompanyChange={setCompany}
              role={role}
              onRoleChange={setRole}
              description={description}
              onDescriptionChange={setDescription}
              url={url}
              onUrlChange={setUrl}
              status={status}
              onStatusChange={setStatus}
              interestLevel={interestLevel}
              onInterestLevelChange={setInterestLevel}
              opportunityStatuses={opportunityStatuses}
            />
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
