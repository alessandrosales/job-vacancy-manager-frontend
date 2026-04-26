"use client"

import { Link } from "react-router"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

export type NavProjectItem = {
  name: string
  url: string
  icon: React.ReactNode
}

export type NavSubmenuConfig = {
  title: string
  icon: React.ReactNode
  items: NavProjectItem[]
  defaultOpen?: boolean
}

export function NavProjects({
  label = "Menu",
  items,
  submenus,
}: {
  label?: string
  items: NavProjectItem[]
  submenus?: NavSubmenuConfig[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <Link to={item.url}>
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
        {submenus?.map((submenu) => (
          <Collapsible
            key={submenu.title}
            asChild
            defaultOpen={submenu.defaultOpen ?? true}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton type="button" tooltip={submenu.title}>
                  {submenu.icon}
                  <span>{submenu.title}</span>
                  <ChevronRightIcon className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {submenu.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.name}>
                      <SidebarMenuSubButton asChild>
                        <Link to={subItem.url}>
                          {subItem.icon}
                          <span>{subItem.name}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
