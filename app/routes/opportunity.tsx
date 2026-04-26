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
import type { InterestLevel, OpportunityStatus } from "~/lib/labels"

export default function OpportunityPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const { opportunities, addOpportunity, updateOpportunity } = useAppData()
  const existing = id ? opportunities.find((o) => o.id === id) : undefined

  const [companyId, setCompanyId] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [status, setStatus] = React.useState<OpportunityStatus>("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(0)

  React.useEffect(() => {
    if (existing) {
      setCompanyId(existing.company_id)
      setRoleId(existing.role_id)
      setDescription(existing.description)
      setUrl(existing.url)
      setStatus(existing.status)
      setInterestLevel(
        Math.min(5, Math.max(0, Math.round(existing.interest_level))) as InterestLevel
      )
      return
    }
    if (!isEdit) {
      setCompanyId("")
      setRoleId("")
      setStatus("")
      setDescription("")
      setUrl("")
      setInterestLevel(0)
    }
  }, [existing, isEdit])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/opportunities", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId || !roleId || !status) return
    const payload = {
      company_id: companyId,
      role_id: roleId,
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
              companyId={companyId}
              onCompanyIdChange={setCompanyId}
              roleId={roleId}
              onRoleIdChange={setRoleId}
              description={description}
              onDescriptionChange={setDescription}
              url={url}
              onUrlChange={setUrl}
              status={status}
              onStatusChange={setStatus}
              interestLevel={interestLevel}
              onInterestLevelChange={setInterestLevel}
            />
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!companyId || !roleId || !status}>
              {isEdit ? "Save changes" : "Save"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      </div>
    </AppLayout>
  )
}
