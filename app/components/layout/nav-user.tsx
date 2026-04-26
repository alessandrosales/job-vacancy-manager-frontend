"use client"

import * as React from "react"
import { Link } from "react-router"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import { applyTheme, getStoredTheme, type ThemeMode } from "~/lib/theme"
import { ChevronsUpDownIcon, LogOutIcon, MoonIcon, UserRoundIcon } from "lucide-react"

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) {
    const w = parts[0]
    return w.slice(0, 2).toUpperCase()
  }
  const a = parts[0][0]
  const b = parts[parts.length - 1][0]
  return `${a ?? ""}${b ?? ""}`.toUpperCase() || "?"
}

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    const stored = getStoredTheme()
    if (stored === "dark") setIsDark(true)
    else if (stored === "light") setIsDark(false)
    else setIsDark(document.documentElement.classList.contains("dark"))
  }, [])

  function setDarkMode(next: boolean) {
    const mode: ThemeMode = next ? "dark" : "light"
    applyTheme(mode)
    setIsDark(next)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="rounded-lg">
                  {initialsFromName(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-start text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ms-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                <Avatar className="size-8 rounded-lg">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="rounded-lg">
                    {initialsFromName(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/my-data">
                <UserRoundIcon />
                My data
              </Link>
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem
              checked={isDark}
              onCheckedChange={(c) => setDarkMode(c === true)}
            >
              <MoonIcon />
              Modo escuro
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/">
                <LogOutIcon />
                Sair
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
