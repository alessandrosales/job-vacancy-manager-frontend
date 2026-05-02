import { useMemo, useState } from "react"
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

import type { Opportunity } from "~/components/providers/app-data-provider"
import { AppLayout } from "~/components/layout/app-layout"
import { Badge } from "~/components/ui/badge"
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
import { OpportunityDialog } from "~/components/opportunities/opportunity-dialog"
import { useAppData } from "~/components/providers/app-data-provider"
import {
  getColumnBadgeProps,
  getEffectiveColumnId,
  sortOpportunitiesByUpdatedAtDesc,
} from "~/lib/kanban-columns"
import {
  formatOpportunityAnnualSalary,
  formatOpportunityHourlyRate,
  opportunityCompanyName,
  opportunityRoleName,
} from "~/lib/opportunity-display"
import { cn } from "~/lib/utils"

function opportunityRecencyScore(opp: Opportunity, indexInList: number): number {
  const m = /^seed-opp-(\d+)$/.exec(opp.id)
  if (m) return Number.parseInt(m[1]!, 10)
  return indexInList
}

function compareTopJobs(
  a: { opp: Opportunity; index: number },
  b: { opp: Opportunity; index: number }
): number {
  const byLevel = b.opp.interest_level - a.opp.interest_level
  if (byLevel !== 0) return byLevel
  return (
    opportunityRecencyScore(b.opp, b.index) -
    opportunityRecencyScore(a.opp, a.index)
  )
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

// --- Mock chart data ---

const pieData = [
  { status: "Interested In",       count: 12, fill: "var(--color-interested)" },
  { status: "Sent Resume",         count: 8,  fill: "var(--color-sent)" },
  { status: "Scheduled Interview", count: 5,  fill: "var(--color-scheduled)" },
  { status: "Waiting Response",    count: 9,  fill: "var(--color-waiting)" },
]

const pieConfig: ChartConfig = {
  count:      { label: "Count" },
  interested: { label: "Interested In",       color: "var(--chart-1)" },
  sent:       { label: "Sent Resume",          color: "var(--chart-2)" },
  scheduled:  { label: "Scheduled Interview",  color: "var(--chart-3)" },
  waiting:    { label: "Waiting Response",     color: "var(--chart-4)" },
}

const barData = [
  { day: "Mon", count: 3 },
  { day: "Tue", count: 5 },
  { day: "Wed", count: 2 },
  { day: "Thu", count: 7 },
  { day: "Fri", count: 4 },
  { day: "Sat", count: 1 },
  { day: "Sun", count: 2 },
]

const barConfig: ChartConfig = {
  count: { label: "Opportunities", color: "var(--chart-1)" },
}

const lineData = [
  { week: "W1", interested: 4, sent: 2, scheduled: 1, waiting: 3 },
  { week: "W2", interested: 6, sent: 3, scheduled: 2, waiting: 4 },
  { week: "W3", interested: 5, sent: 5, scheduled: 3, waiting: 3 },
  { week: "W4", interested: 8, sent: 6, scheduled: 5, waiting: 5 },
]

const lineConfig: ChartConfig = {
  interested: { label: "Interested In",       color: "var(--chart-1)" },
  sent:       { label: "Sent Resume",          color: "var(--chart-2)" },
  scheduled:  { label: "Scheduled Interview",  color: "var(--chart-3)" },
  waiting:    { label: "Waiting Response",     color: "var(--chart-4)" },
}

const DASHBOARD_TABLE_LIMIT = 10

export default function DashboardPage() {
  const {
    opportunities,
    opportunity_statuses: opportunityStatuses,
    kanban_custom_columns: kanbanCustomColumns,
    companies,
    roles,
  } = useAppData()
  const [dialogOppId, setDialogOppId] = useState<string | null>(null)
  const recent = useMemo(
    () =>
      sortOpportunitiesByUpdatedAtDesc(opportunities).slice(
        0,
        DASHBOARD_TABLE_LIMIT
      ),
    [opportunities]
  )

  const topJobs = useMemo(() => {
    return [...opportunities]
      .map((opp, index) => ({ opp, index }))
      .sort(compareTopJobs)
      .slice(0, DASHBOARD_TABLE_LIMIT)
      .map(({ opp }) => opp)
  }, [opportunities])

  return (
    <AppLayout title="Dashboard">
      <OpportunityDialog
        open={dialogOppId !== null}
        onOpenChange={(open) => {
          if (!open) setDialogOppId(null)
        }}
        opportunityId={dialogOppId}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto [&>*]:shrink-0">
      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Pie — by status */}
        <Card>
          <CardHeader>
            <CardTitle>By Status</CardTitle>
            <CardDescription>Opportunities distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieConfig} className="mx-auto max-h-52">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={pieData} dataKey="count" nameKey="status" innerRadius={40} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bar — by day */}
        <Card>
          <CardHeader>
            <CardTitle>By Day</CardTitle>
            <CardDescription>Registrations this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="max-h-52 w-full">
              <BarChart data={barData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Line — status over time */}
        <Card>
          <CardHeader>
            <CardTitle>Trend by Status</CardTitle>
            <CardDescription>Weekly evolution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineConfig} className="max-h-52 w-full">
              <LineChart data={lineData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line dataKey="interested" stroke="var(--color-interested)" strokeWidth={2} dot={false} />
                <Line dataKey="sent"       stroke="var(--color-sent)"       strokeWidth={2} dot={false} />
                <Line dataKey="scheduled"  stroke="var(--color-scheduled)"  strokeWidth={2} dot={false} />
                <Line dataKey="waiting"    stroke="var(--color-waiting)"    strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top jobs — higher interest_level first, then more recent */}
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>Top jobs</CardTitle>
          <CardDescription>
            Até {DASHBOARD_TABLE_LIMIT} vagas: maior interesse primeiro; em empate, mais
            recentes. A tabela acompanha a altura do conteúdo.
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
                topJobs.map((opp) => {
                  const s = getColumnBadgeProps(
                    getEffectiveColumnId(opp),
                    opportunityStatuses,
                    kanbanCustomColumns
                  )
                  return (
                    <TableRow
                      key={opp.id}
                      className="cursor-pointer"
                      onClick={() => setDialogOppId(opp.id)}
                    >
                      <TableCell className="font-medium">
                        {opportunityCompanyName(opp, companies)}
                      </TableCell>
                      <TableCell>{opportunityRoleName(opp, roles)}</TableCell>
                      <TableCell>
                        <InterestStars level={opp.interest_level} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                        {formatOpportunityHourlyRate(opp.hourly_rate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                        {formatOpportunityAnnualSalary(opp.annual_salary)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent opportunities table */}
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>Recent Opportunities</CardTitle>
          <CardDescription>
            Últimas {DASHBOARD_TABLE_LIMIT} oportunidades adicionadas (ordem do registro)
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
                recent.map((opp) => {
                  const s = getColumnBadgeProps(
                    getEffectiveColumnId(opp),
                    opportunityStatuses,
                    kanbanCustomColumns
                  )
                  return (
                    <TableRow
                      key={opp.id}
                      className="cursor-pointer"
                      onClick={() => setDialogOppId(opp.id)}
                    >
                      <TableCell className="font-medium">
                        {opportunityCompanyName(opp, companies)}
                      </TableCell>
                      <TableCell>{opportunityRoleName(opp, roles)}</TableCell>
                      <TableCell>
                        <InterestStars level={opp.interest_level} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                        {formatOpportunityHourlyRate(opp.hourly_rate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                        {formatOpportunityAnnualSalary(opp.annual_salary)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  )
}
