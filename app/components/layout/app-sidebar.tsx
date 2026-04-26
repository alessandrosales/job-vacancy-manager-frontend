"use client"

import * as React from "react"
import { useNavigate } from "react-router"

// import { NavMain } from "~/components/layout/nav-main"
import { OpportunityDialog } from "~/components/opportunities/opportunity-dialog"
import { NavProjects } from "~/components/layout/nav-projects"
import { NavUser } from "~/components/layout/nav-user"
import { useSessionUser } from "~/components/providers/session-user-provider"
// import { TeamSwitcher } from "~/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  // SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "~/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  BriefcaseIcon,
  BuildingIcon,
  ListOrderedIcon,
  UserCogIcon,
  SparklesIcon,
  CirclePlusIcon,
} from "lucide-react"

const data = {
  // TODO: seletor de empresa (TeamSwitcher) — descomente `teams` abaixo, importe GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon do lucide-react, importe TeamSwitcher + SidebarHeader e o JSX comentado mais abaixo.
  // teams: [
  //   {
  //     name: "Acme Inc",
  //     logo: <GalleryVerticalEndIcon />,
  //     plan: "Enterprise",
  //   },
  //   {
  //     name: "Acme Corp.",
  //     logo: <AudioLinesIcon />,
  //     plan: "Startup",
  //   },
  //   {
  //     name: "Evil Corp.",
  //     logo: <TerminalIcon />,
  //     plan: "Free",
  //   },
  // ],
  // TODO: seção "Platform" (NavMain + subníveis) — descomente `navMain`, importe NavMain + ícones TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon e o <NavMain> no SidebarContent.
  // navMain: [
  //   {
  //     title: "Playground",
  //     url: "#",
  //     icon: <TerminalSquareIcon />,
  //     isActive: true,
  //     items: [
  //       { title: "History", url: "#" },
  //       { title: "Starred", url: "#" },
  //       { title: "Settings", url: "#" },
  //     ],
  //   },
  //   {
  //     title: "Models",
  //     url: "#",
  //     icon: <BotIcon />,
  //     items: [
  //       { title: "Genesis", url: "#" },
  //       { title: "Explorer", url: "#" },
  //       { title: "Quantum", url: "#" },
  //     ],
  //   },
  //   {
  //     title: "Documentation",
  //     url: "#",
  //     icon: <BookOpenIcon />,
  //     items: [
  //       { title: "Introduction", url: "#" },
  //       { title: "Get Started", url: "#" },
  //       { title: "Tutorials", url: "#" },
  //       { title: "Changelog", url: "#" },
  //     ],
  //   },
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: <Settings2Icon />,
  //     items: [
  //       { title: "General", url: "#" },
  //       { title: "Team", url: "#" },
  //       { title: "Billing", url: "#" },
  //       { title: "Limits", url: "#" },
  //     ],
  //   },
  // ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      name: "Opportunities",
      url: "/opportunities",
      icon: <BriefcaseIcon />,
    },
    {
      name: "Opportunity statuses",
      url: "/opportunities/statuses",
      icon: <ListOrderedIcon />,
    },
    {
      name: "Companies",
      url: "/companies",
      icon: <BuildingIcon />,
    },
    {
      name: "Roles",
      url: "/roles",
      icon: <UserCogIcon />,
    },
    {
      name: "Skills",
      url: "/skills",
      icon: <SparklesIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useSessionUser()
  const navigate = useNavigate()
  const [newOpportunityOpen, setNewOpportunityOpen] = React.useState(false)

  return (
    <>
      <OpportunityDialog
        mode="create"
        open={newOpportunityOpen}
        onOpenChange={setNewOpportunityOpen}
        opportunityId={null}
        onCreated={(id) =>
          navigate(`/opportunities/opportunity/${encodeURIComponent(id)}`)
        }
      />
    <Sidebar collapsible="icon" {...props}>
      {/* Seletor de empresas (TeamSwitcher) — desativado por enquanto.
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      */}
      <SidebarContent>
        {/* Platform (NavMain + subníveis) — desativado por enquanto.
        <NavMain items={data.navMain} />
        */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                tooltip="New opportunity"
                onClick={() => setNewOpportunityOpen(true)}
              >
                <CirclePlusIcon />
                <span>New opportunity</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    </>
  )
}
