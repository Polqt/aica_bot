"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Home, Briefcase, Bookmark, User, Sparkles, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

function AppSidebar() {
  const { logout } = useAuth()
  const navItems = [
    {
      title: "DASHBOARD",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "JOB MATCHES",
      url: "/job-matches",
      icon: Briefcase,
    },
    {
      title: "SAVED JOBS",
      url: "/saved-jobs",
      icon: Bookmark,
    },
    {
      title: "PROFILE",
      url: "/user-profile",
      icon: User,
    },
  ]

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold uppercase tracking-wide shadow-lg hover:shadow-xl transition-all duration-200 p-6 rounded-lg"
            >
              <div className="flex aspect-square size-12 items-center justify-center rounded-xl bg-white/20">
                <Sparkles className="size-6 text-white" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-4">
                <span className="truncate font-black text-xl text-gray-800">AICA</span>
                <span className="truncate text-xs font-bold uppercase text-gray-700">AI CAREER ASSISTANT</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-900 font-semibold uppercase tracking-wide text-lg mb-4 border-b border-gray-200 pb-2">
            NAVIGATION
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  className="bg-white border border-gray-200 hover:bg-violet-50 hover:border-violet-200 font-semibold uppercase tracking-wide shadow-sm hover:shadow-md transition-all duration-200 p-4 rounded-lg"
                >
                  <Link href={item.url}>
                    <item.icon className="w-6 h-6" />
                    <span className="ml-3">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t-4 border-black p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold uppercase tracking-wide shadow-sm hover:shadow-md transition-all duration-200 p-4 rounded-lg w-full"
            >
              <LogOut className="w-6 h-6" />
              <span className="ml-3">LOG OUT</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 sm:h-20 shrink-0 items-center gap-2 sm:gap-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b-4 border-black bg-white px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <SidebarTrigger className="bg-black text-white border-2 border-black hover:bg-white hover:text-black w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-[4px_4px_0px_0px_black] hover:shadow-[8px_8px_0px_0px_black] transition-all duration-200 flex-shrink-0" />
            <Breadcrumb className="min-w-0">
              <BreadcrumbList className="flex items-center gap-1 sm:gap-2">
                <BreadcrumbItem className="hidden sm:block">
                  <BreadcrumbLink
                    href="#"
                    className="font-black uppercase tracking-wide text-black hover:text-violet-600 transition-colors text-sm sm:text-base truncate"
                  >
                    AICA DASHBOARD
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:block text-black font-black" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-black uppercase tracking-wide text-black text-sm sm:text-base">
                    MAIN
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 sm:gap-8 p-4 sm:p-8 pt-4 sm:pt-8 bg-gray-50">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
