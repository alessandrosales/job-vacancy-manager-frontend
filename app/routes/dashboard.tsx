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
import { useAppData } from "~/components/providers/app-data-provider"
import { getColumnBadgeProps, getEffectiveColumnId } from "~/lib/kanban-columns"

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

export default function DashboardPage() {
  const {
    opportunities,
    opportunity_statuses: opportunityStatuses,
    kanban_custom_columns: kanbanCustomColumns,
  } = useAppData()
  const recent = opportunities.slice(0, 5)

  return (
    <AppLayout title="Dashboard">
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
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

      {/* Recent opportunities table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Opportunities</CardTitle>
          <CardDescription>Last registered entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
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
                    <TableRow key={opp.id}>
                      <TableCell className="font-medium">{opp.company}</TableCell>
                      <TableCell>{opp.role}</TableCell>
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
