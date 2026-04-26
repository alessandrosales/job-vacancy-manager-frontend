import * as React from "react"
import { Link } from "react-router"

import { useAppData } from "~/components/providers/app-data-provider"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { interestBadge } from "~/lib/labels"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

export default function CompaniesPage() {
  const { companies, deleteCompany } = useAppData()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  return (
    <AppLayout title="Companies">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          <Button asChild className="shrink-0 self-start sm:self-center">
            <Link to="/companies/company">
              <PlusIcon data-icon="inline-start" />
              Add company
            </Link>
          </Button>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <CardTitle>Companies</CardTitle>
            <CardDescription>
              Companies you are tracking for opportunities
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Actions</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Interest Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No companies yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => {
                  const cfg = interestBadge[company.interestLevel]
                  return (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex justify-start gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              to={`/companies/company/${encodeURIComponent(company.id)}`}
                              aria-label="Edit company"
                            >
                              <PencilIcon />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete company"
                            onClick={() => setDeleteId(company.id)}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        <a
                          href={company.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {company.url}
                        </a>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {company.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant}>{company.interestLevel}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete company?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the company from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteId) deleteCompany(deleteId)
                setDeleteId(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  )
}
