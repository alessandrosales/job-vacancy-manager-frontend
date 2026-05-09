"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

// import { NavMain } from "~/components/layout/nav-main"
import { NavProjects } from "~/components/layout/nav-projects"
import { NavUser } from "~/components/layout/nav-user"
import { useSessionUser } from "~/components/providers/session-user-provider"
import { defaultI18nNs } from "~/lib/i18n/config"
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
  LanguagesIcon,
  Link2Icon,
  CirclePlusIcon,
  FileStackIcon,
  HistoryIcon,
  AwardIcon,
  GraduationCapIcon,
  FolderTreeIcon,
  ScrollTextIcon,
} from "lucide-react"

/* TODO TeamSwitcher — ver histórico em git para `teams` + SidebarHeader */
/* TODO NavMain + subníveis — ver histórico em git para `navMain` + ícones */

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation(defaultI18nNs)
  const { user } = useSessionUser()
  const navigate = useNavigate()

  const { menuTop, menuReference, historyProjects } = React.useMemo(
    () => ({
      menuTop: [
        {
          name: t("nav_dashboard"),
          url: "/dashboard",
          icon: <LayoutDashboardIcon />,
        },
        {
          name: t("nav_opportunities"),
          url: "/opportunities",
          icon: <BriefcaseIcon />,
        },
        {
          name: t("nav_resumes"),
          url: "/resumes",
          icon: <FileStackIcon />,
        },
      ],
      menuReference: [
        {
          name: t("nav_opportunity_statuses"),
          url: "/opportunities/statuses",
          icon: <ListOrderedIcon />,
        },
        {
          name: t("nav_companies"),
          url: "/companies",
          icon: <BuildingIcon />,
        },
        {
          name: t("nav_roles"),
          url: "/roles",
          icon: <UserCogIcon />,
        },
        {
          name: t("nav_skills"),
          url: "/skills",
          icon: <SparklesIcon />,
        },
        {
          name: t("nav_languages"),
          url: "/languages",
          icon: <LanguagesIcon />,
        },
        {
          name: t("nav_links"),
          url: "/links",
          icon: <Link2Icon />,
        },
      ],
      historyProjects: [
        {
          name: t("nav_work_experience"),
          url: "/work-experiences",
          icon: <HistoryIcon />,
        },
        {
          name: t("nav_certifications"),
          url: "/certifications",
          icon: <AwardIcon />,
        },
        {
          name: t("nav_education"),
          url: "/educations",
          icon: <GraduationCapIcon />,
        },
      ],
    }),
    [t]
  )

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
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                tooltip={t("nav_new_opportunity")}
                onClick={() => navigate("/opportunities/opportunity")}
              >
                <CirclePlusIcon />
                <span>{t("nav_new_opportunity")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <NavProjects
          label={t("nav_menu_section")}
          items={menuTop}
          submenus={[
            {
              title: t("nav_history_section"),
              icon: <ScrollTextIcon />,
              defaultOpen: true,
              items: historyProjects,
            },
            {
              title: t("nav_reference_section"),
              icon: <FolderTreeIcon />,
              defaultOpen: true,
              items: menuReference,
            },
          ]}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
