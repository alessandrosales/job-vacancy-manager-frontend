import * as React from "react"
import { Link } from "react-router"

import { AppSidebar } from "~/components/layout/app-sidebar"
import { FloatingAgentAssistant } from "~/components/layout/floating-agent-assistant"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"

export interface AppLayoutBreadcrumb {
  label: string
  to?: string
}

interface AppLayoutProps {
  title: string
  breadcrumbs?: AppLayoutBreadcrumb[]
  children: React.ReactNode
}

export function AppLayout({ title, breadcrumbs, children }: AppLayoutProps) {
  const crumbs: AppLayoutBreadcrumb[] =
    breadcrumbs ??
    (title === "Dashboard"
      ? [{ label: "Dashboard" }]
      : [
          { label: "Dashboard", to: "/dashboard" },
          { label: title },
        ])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ms-1" />
            <Separator
              orientation="vertical"
              className="me-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {crumbs.map((crumb, i) => {
                  const isLast = i === crumbs.length - 1
                  return (
                    <React.Fragment key={`${crumb.label}-${String(i)}`}>
                      {i > 0 ? (
                        <BreadcrumbSeparator className="hidden md:block" />
                      ) : null}
                      <BreadcrumbItem
                        className={
                          crumbs.length > 1 && i === 0
                            ? "hidden md:block"
                            : undefined
                        }
                      >
                        {isLast || !crumb.to ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={crumb.to}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden p-4 pt-0">
          {children}
        </div>
        <FloatingAgentAssistant />
      </SidebarInset>
    </SidebarProvider>
  )
}
