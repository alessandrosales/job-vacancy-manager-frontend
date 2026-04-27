import * as React from "react"
import { useNavigate, useParams } from "react-router"

import { OpportunityFormFields } from "~/components/opportunities/opportunity-form-fields"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"
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
  const [hourlyRate, setHourlyRate] = React.useState<number | undefined>(undefined)
  const [annualSalary, setAnnualSalary] = React.useState<number | undefined>(undefined)
  const [status, setStatus] = React.useState<OpportunityStatus>("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(0)
  const [postSaveOpen, setPostSaveOpen] = React.useState(false)

  React.useEffect(() => {
    if (existing) {
      setCompanyId(existing.company_id)
      setRoleId(existing.role_id)
      setDescription(existing.description)
      setUrl(existing.url)
      setHourlyRate(
        existing.hourly_rate != null && Number.isFinite(existing.hourly_rate)
          ? existing.hourly_rate
          : undefined
      )
      setAnnualSalary(
        existing.annual_salary != null && Number.isFinite(existing.annual_salary)
          ? existing.annual_salary
          : undefined
      )
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
      setHourlyRate(undefined)
      setAnnualSalary(undefined)
      setInterestLevel(0)
    }
  }, [existing, isEdit])

  React.useEffect(() => {
    if (isEdit && id && !existing) {
      navigate("/opportunities", { replace: true })
    }
  }, [isEdit, id, existing, navigate])

  function resetForm() {
    setCompanyId("")
    setRoleId("")
    setDescription("")
    setUrl("")
    setHourlyRate(undefined)
    setAnnualSalary(undefined)
    setStatus("")
    setInterestLevel(0)
  }

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
      hourly_rate: hourlyRate,
      annual_salary: annualSalary,
    }
    if (isEdit && id) {
      updateOpportunity(id, payload)
      navigate("/opportunities")
    } else {
      addOpportunity(payload)
      setPostSaveOpen(true)
    }
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
              hourlyRate={hourlyRate}
              onHourlyRateChange={setHourlyRate}
              annualSalary={annualSalary}
              onAnnualSalaryChange={setAnnualSalary}
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
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel="Opportunity"
        onGoToList={() => navigate("/opportunities")}
        onAddAnother={() => { setPostSaveOpen(false); resetForm() }}
      />
    </AppLayout>
  )
}
