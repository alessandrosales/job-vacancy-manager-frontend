"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router"

import { AuthenticatedSessionBootstrap } from "~/components/layout/authenticated-session-bootstrap"
import { OpenAiKeyOnboardingDialog } from "~/components/onboarding/open-ai-key-onboarding-dialog"
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
  const { t: tc } = useTranslation("common")
  const location = useLocation()
  const isDashboardPath = location.pathname === "/dashboard"
  const dashboardLabel = tc("breadcrumb_dashboard")
  const crumbs: AppLayoutBreadcrumb[] =
    breadcrumbs ??
    (isDashboardPath
      ? [{ label: dashboardLabel }]
      : [{ label: dashboardLabel, to: "/dashboard" }, { label: title }])

  return (
    <SidebarProvider>
      <AuthenticatedSessionBootstrap />
      <OpenAiKeyOnboardingDialog />
      <AppSidebar />
      <SidebarInset className="relative min-h-0 overflow-hidden">
        <div
          aria-hidden
          className="app-layout-crystal-bg pointer-events-none absolute inset-0 z-0"
        />
        <header className="relative z-10 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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
                  const hideRootOnMobile = crumbs.length > 1 && i === 0
                  const hideLeadingSeparatorOnMobile =
                    crumbs.length > 1 && i === 1
                  return (
                    <React.Fragment key={`${crumb.label}-${String(i)}`}>
                      {i > 0 ? (
                        <BreadcrumbSeparator
                          className={
                            hideLeadingSeparatorOnMobile
                              ? "hidden md:block"
                              : undefined
                          }
                        />
                      ) : null}
                      <BreadcrumbItem
                        className={
                          hideRootOnMobile ? "hidden md:block" : undefined
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
        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-6 overflow-hidden p-4 pt-0">
          {children}
        </div>
        <FloatingAgentAssistant />
      </SidebarInset>
    </SidebarProvider>
  )
}
