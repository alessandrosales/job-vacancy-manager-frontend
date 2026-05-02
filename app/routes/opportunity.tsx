import * as React from "react"
import { useNavigate, useParams } from "react-router"

import {
  OpportunityFormFields,
  type OpportunityFormReferenceLists,
} from "~/components/opportunities/opportunity-form-fields"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"
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
import { ApiError } from "~/lib/api/errors"
import {
  apiCompanyToCompany,
  apiOpportunityStatusToDefinition,
  apiOpportunityToOpportunity,
  apiRoleToRole,
  opportunityFormToApiWrite,
} from "~/lib/opportunity-api-mappers"
import { listCompanies } from "~/lib/api/resources/companies"
import {
  createOpportunity as createOpportunityApi,
  getOpportunity as getOpportunityApi,
  updateOpportunity as updateOpportunityApi,
} from "~/lib/api/resources/opportunities"
import { listOpportunityStatuses } from "~/lib/api/resources/opportunity-statuses"
import { listRoles } from "~/lib/api/resources/roles"
import type { InterestLevel, OpportunityStatus } from "~/lib/labels"

function formErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.company_id ?? []),
      ...(err.fieldErrors.role_id ?? []),
      ...(err.fieldErrors.status_id ?? []),
      ...(err.fieldErrors.description ?? []),
      ...(err.fieldErrors.url ?? []),
      ...(err.fieldErrors.interest_level ?? []),
      ...(err.fieldErrors.hourly_rate ?? []),
      ...(err.fieldErrors.annual_salary ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts.join(" ")
  }
  return "Could not save opportunity."
}

function listsErrorText(err: unknown): string {
  if (err instanceof ApiError) {
    const b = err.fieldErrors.base?.[0]
    if (b) return b
  }
  return "Could not load form data (companies, roles, or statuses)."
}

export default function OpportunityPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [referenceLists, setReferenceLists] =
    React.useState<OpportunityFormReferenceLists | null>(null)
  const [listsLoadState, setListsLoadState] = React.useState<
    "loading" | "error" | "idle"
  >("loading")
  const [listsError, setListsError] = React.useState<string | null>(null)

  const [companyId, setCompanyId] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [hourlyRate, setHourlyRate] = React.useState<number | undefined>(undefined)
  const [annualSalary, setAnnualSalary] = React.useState<number | undefined>(undefined)
  const [status, setStatus] = React.useState<OpportunityStatus>("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(0)
  const [postSaveOpen, setPostSaveOpen] = React.useState(false)

  const [oppLoadState, setOppLoadState] = React.useState<"idle" | "loading">(
    isEdit ? "loading" : "idle"
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const refreshReferenceLists = React.useCallback(async () => {
    try {
      const [companies, roles, statuses] = await Promise.all([
        listCompanies({ paginated: false }),
        listRoles({ paginated: false }),
        listOpportunityStatuses({ paginated: false }),
      ])
      setReferenceLists({
        companies: companies.map(apiCompanyToCompany),
        roles: roles.map(apiRoleToRole),
        opportunityStatuses: statuses.map(apiOpportunityStatusToDefinition),
      })
    } catch {
      /* mantém listas anteriores */
    }
  }, [])

  React.useEffect(() => {
    let cancelled = false
    setListsLoadState("loading")
    setListsError(null)
    void Promise.all([
      listCompanies({ paginated: false }),
      listRoles({ paginated: false }),
      listOpportunityStatuses({ paginated: false }),
    ])
      .then(([companies, roles, statuses]) => {
        if (cancelled) return
        setReferenceLists({
          companies: companies.map(apiCompanyToCompany),
          roles: roles.map(apiRoleToRole),
          opportunityStatuses: statuses.map(apiOpportunityStatusToDefinition),
        })
        setListsLoadState("idle")
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setListsLoadState("error")
        setListsError(listsErrorText(e))
      })
    return () => {
      cancelled = true
    }
  }, [])

  React.useEffect(() => {
    if (!isEdit || !id) {
      setOppLoadState("idle")
      return
    }

    let cancelled = false
    setOppLoadState("loading")
    void getOpportunityApi(id)
      .then((api) => {
        if (cancelled) return
        const o = apiOpportunityToOpportunity(api)
        setCompanyId(o.company_id)
        setRoleId(o.role_id)
        setDescription(o.description)
        setUrl(o.url)
        setHourlyRate(o.hourly_rate)
        setAnnualSalary(o.annual_salary)
        setStatus(o.status)
        setInterestLevel(
          Math.min(5, Math.max(0, Math.round(o.interest_level))) as InterestLevel
        )
        setOppLoadState("idle")
      })
      .catch(() => {
        if (!cancelled) navigate("/opportunities", { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, id, navigate])

  React.useEffect(() => {
    if (isEdit) return
    setCompanyId("")
    setRoleId("")
    setDescription("")
    setUrl("")
    setHourlyRate(undefined)
    setAnnualSalary(undefined)
    setStatus("")
    setInterestLevel(0)
  }, [isEdit])

  function resetForm() {
    setCompanyId("")
    setRoleId("")
    setDescription("")
    setUrl("")
    setHourlyRate(undefined)
    setAnnualSalary(undefined)
    setStatus("")
    setInterestLevel(0)
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    setFormError(null)
    if (!companyId || !roleId || !status) return

    const payload = opportunityFormToApiWrite({
      company_id: companyId,
      role_id: roleId,
      status_id: status,
      description: description.trim(),
      url: url.trim(),
      interest_level: interestLevel,
      hourly_rate: hourlyRate,
      annual_salary: annualSalary,
    })

    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateOpportunityApi(id, payload)
        navigate("/opportunities")
      } else {
        await createOpportunityApi(payload)
        setPostSaveOpen(true)
      }
    } catch (err) {
      setFormError(formErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (listsLoadState === "loading") {
    return (
      <AppLayout
        title={isEdit ? "Edit opportunity" : "New opportunity"}
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Opportunities", to: "/opportunities" },
          { label: isEdit ? "Edit" : "New" },
        ]}
      >
        <p className="text-muted-foreground">Loading form…</p>
      </AppLayout>
    )
  }

  if (listsLoadState === "error" || !referenceLists) {
    return (
      <AppLayout
        title={isEdit ? "Edit opportunity" : "New opportunity"}
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Opportunities", to: "/opportunities" },
          { label: isEdit ? "Edit" : "New" },
        ]}
      >
        <p className="text-destructive text-sm" role="alert">
          {listsError ?? "Could not load form data."}
        </p>
      </AppLayout>
    )
  }

  if (isEdit && oppLoadState === "loading") {
    return (
      <AppLayout
        title="Edit opportunity"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Opportunities", to: "/opportunities" },
          { label: "Edit" },
        ]}
      >
        <p className="text-muted-foreground">Loading opportunity…</p>
      </AppLayout>
    )
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
            onSubmit={(ev) => void handleSubmit(ev)}
            className="flex flex-col gap-4"
          >
            <CardContent>
              {formError ? (
                <p className="text-destructive mb-2 text-sm" role="alert">
                  {formError}
                </p>
              ) : null}
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
                referenceLists={referenceLists}
                onReferenceDataRefresh={refreshReferenceLists}
              />
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!companyId || !roleId || !status || submitting}
              >
                {submitting ? "Saving…" : isEdit ? "Save changes" : "Save"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel="Opportunity"
        onGoToList={() => navigate("/opportunities")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
