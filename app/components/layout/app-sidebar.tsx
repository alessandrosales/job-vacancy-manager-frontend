"use client"

import * as React from "react"

// import { NavMain } from "~/components/layout/nav-main"
import { NavProjects } from "~/components/layout/nav-projects"
import { NavUser } from "~/components/layout/nav-user"
// import { TeamSwitcher } from "~/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  // SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar"
import { FrameIcon, PieChartIcon, MapIcon } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
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
      name: "Design Engineering",
      url: "#",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Travel",
      url: "#",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
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
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
