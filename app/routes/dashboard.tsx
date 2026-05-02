import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { StarIcon } from "lucide-react"

import type { OpportunityFormReferenceLists } from "~/components/opportunities/opportunity-form-fields"
import { OpportunityDialog } from "~/components/opportunities/opportunity-dialog"
import { AppLayout } from "~/components/layout/app-layout"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import { ApiError } from "~/lib/api/errors"
import type { ApiCompany } from "~/lib/api/resources/companies"
import {
  getDashboard,
  type ApiDashboardOpportunityRow,
} from "~/lib/api/resources/dashboard"
import type { ApiOpportunityStatus } from "~/lib/api/resources/opportunity-statuses"
import type { ApiRole } from "~/lib/api/resources/roles"
import {
  apiCompanyToCompany,
  apiOpportunityStatusToDefinition,
  apiOpportunityToOpportunity,
  apiRoleToRole,
} from "~/lib/opportunity-api-mappers"
import {
  formatOpportunityAnnualSalary,
  formatOpportunityHourlyRate,
} from "~/lib/opportunity-display"
import type { StatusBadgeVariant } from "~/lib/labels"
import { cn } from "~/lib/utils"

const DASHBOARD_TABLE_LIMIT = 10

function dashboardListsErrorText(err: unknown): string {
  if (err instanceof ApiError) {
    return err.fieldErrors.base?.[0] ?? "Could not load dashboard."
  }
  return "Could not load dashboard."
}

function mapReferenceLists(raw: {
  companies: ApiCompany[]
  roles: ApiRole[]
  opportunity_statuses: ApiOpportunityStatus[]
}): OpportunityFormReferenceLists {
  return {
    companies: raw.companies.map(apiCompanyToCompany),
    roles: raw.roles.map(apiRoleToRole),
    opportunityStatuses: raw.opportunity_statuses.map(apiOpportunityStatusToDefinition),
  }
}

function InterestStars({ level }: { level: number }) {
  return (
    <div
      className="inline-flex items-center gap-0.5"
      aria-label={`Interest level ${level} of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={cn(
            "size-3.5",
            i < level ? "fill-current text-amber-500" : "text-muted-foreground/35"
          )}
        />
      ))}
    </div>
  )
}

function DashboardOpportunityRow({
  row,
  onOpen,
}: {
  row: ApiDashboardOpportunityRow
  onOpen: (id: string) => void
}) {
  const opp = apiOpportunityToOpportunity(row)
  const variant = row.status_variant as StatusBadgeVariant

  return (
    <TableRow
      className="cursor-pointer"
      onClick={() => onOpen(row.id)}
    >
      <TableCell className="font-medium">{row.company_name}</TableCell>
      <TableCell>{row.role_name}</TableCell>
      <TableCell>
        <InterestStars level={opp.interest_level} />
      </TableCell>
      <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
        {formatOpportunityHourlyRate(opp.hourly_rate)}
      </TableCell>
      <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
        {formatOpportunityAnnualSalary(opp.annual_salary)}
      </TableCell>
      <TableCell>
        <Badge variant={variant}>{row.status_label}</Badge>
      </TableCell>
    </TableRow>
  )
}

export default function DashboardPage() {
  const [loadState, setLoadState] = React.useState<"loading" | "idle" | "error">(
    "loading"
  )
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [payload, setPayload] = React.useState<Awaited<
    ReturnType<typeof getDashboard>
  > | null>(null)
  const [dialogOppId, setDialogOppId] = React.useState<string | null>(null)

  const referenceLists = React.useMemo(
    () => (payload ? mapReferenceLists(payload.reference_lists) : null),
    [payload]
  )

  const fetchDashboard = React.useCallback(async () => {
    setLoadState("loading")
    setLoadError(null)
    try {
      const data = await getDashboard()
      setPayload(data)
      setLoadState("idle")
    } catch (e) {
      setLoadError(dashboardListsErrorText(e))
      setLoadState("error")
    }
  }, [])

  React.useEffect(() => {
    void fetchDashboard()
  }, [fetchDashboard])

  const pieData = React.useMemo(() => {
    if (!payload?.pie_by_status.length) return []
    return payload.pie_by_status.map((row, i) => ({
      status: row.label,
      count: row.count,
      fill: `var(--chart-${(i % 5) + 1})`,
    }))
  }, [payload])

  const pieConfig = React.useMemo<ChartConfig>(() => {
    const cfg: ChartConfig = {
      count: { label: "Opportunities" },
    }
    pieData.forEach((row, i) => {
      cfg[row.status] = {
        label: row.status,
        color: `var(--chart-${(i % 5) + 1})`,
      }
    })
    return cfg
  }, [pieData])

  const barData = React.useMemo(
    () => payload?.created_by_weekday ?? [],
    [payload]
  )

  const barConfig = React.useMemo<ChartConfig>(
    () => ({
      count: { label: "Opportunities", color: "var(--chart-1)" },
    }),
    []
  )

  const lineData = React.useMemo(() => {
    if (!payload?.trend_by_week.length || !payload.status_series.length) return []
    return payload.trend_by_week.map((week) => {
      const row: Record<string, string | number> = {
        week: week.week_label,
      }
      for (const s of payload.status_series) {
        row[s.status_id] = week.counts_by_status_id[s.status_id] ?? 0
      }
      return row
    })
  }, [payload])

  const lineConfig = React.useMemo<ChartConfig>(() => {
    if (!payload?.status_series.length) return {}
    const cfg: ChartConfig = {}
    payload.status_series.forEach((s, i) => {
      cfg[s.status_id] = {
        label: s.label,
        color: `var(--chart-${(i % 5) + 1})`,
      }
    })
    return cfg
  }, [payload])

  const topJobs = payload?.top_opportunities ?? []
  const recent = payload?.recent_opportunities ?? []

  return (
    <AppLayout title="Dashboard">
      <OpportunityDialog
        open={dialogOppId !== null}
        onOpenChange={(open) => {
          if (!open) setDialogOppId(null)
        }}
        opportunityId={dialogOppId}
        referenceLists={referenceLists ?? undefined}
        onSaved={() => void fetchDashboard()}
        onReferenceListsRefresh={() => void fetchDashboard()}
      />

      {loadState === "error" ? (
        <div className="flex flex-col gap-3 py-6" role="alert">
          <p className="text-destructive text-sm">{loadError}</p>
          <Button type="button" variant="outline" onClick={() => void fetchDashboard()}>
            Retry
          </Button>
        </div>
      ) : null}

      {loadState === "loading" && !payload ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Loading dashboard…
        </p>
      ) : null}

      {payload ? (
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto [&>*]:shrink-0">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>By Status</CardTitle>
                <CardDescription>Opportunities distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No opportunities yet.
                  </p>
                ) : (
                  <ChartContainer config={pieConfig} className="mx-auto max-h-52">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={pieData}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={40}
                      />
                    </PieChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>By Day</CardTitle>
                <CardDescription>
                  New opportunities created this week (Mon–Sun)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={barConfig} className="max-h-52 w-full">
                  <BarChart data={barData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trend by Status</CardTitle>
                <CardDescription>
                  Opportunities created per week (last 4 weeks), by status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lineData.length === 0 || !payload.status_series.length ? (
                  <p className="text-muted-foreground py-8 text-center text-sm">
                    No trend data yet.
                  </p>
                ) : (
                  <ChartContainer config={lineConfig} className="max-h-52 w-full">
                    <LineChart data={lineData}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="week" tickLine={false} axisLine={false} />
                      <YAxis hide />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      {payload.status_series.map((s) => (
                        <Line
                          key={s.status_id}
                          type="monotone"
                          dataKey={s.status_id}
                          stroke={`var(--color-${s.status_id})`}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle>Top jobs</CardTitle>
              <CardDescription>
                Up to {DASHBOARD_TABLE_LIMIT} roles: highest interest first; ties by
                most recently updated.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-36">Interesse</TableHead>
                    <TableHead>Hourly rate</TableHead>
                    <TableHead>Annual salary</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        No opportunities yet. Add some under Opportunities.
                      </TableCell>
                    </TableRow>
                  ) : (
                    topJobs.map((row) => (
                      <DashboardOpportunityRow
                        key={row.id}
                        row={row}
                        onOpen={setDialogOppId}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle>Recent opportunities</CardTitle>
              <CardDescription>
                Last {DASHBOARD_TABLE_LIMIT} by last update (`updated_at`)
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-visible">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-36">Interesse</TableHead>
                    <TableHead>Hourly rate</TableHead>
                    <TableHead>Annual salary</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recent.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        No opportunities yet. Add some under Opportunities.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recent.map((row) => (
                      <DashboardOpportunityRow
                        key={row.id}
                        row={row}
                        onOpen={setDialogOppId}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </AppLayout>
  )
}
