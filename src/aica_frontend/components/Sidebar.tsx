'use client';

import Link from 'next/link';
import {
  Home,
  Briefcase,
  Bookmark,
  User,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail } from './ui/sidebar';

function AppSidebar() {
  const { logout } = useAuth();
  const navItems = [
    {
      title: 'DASHBOARD',
      url: '/dashboard',
      icon: Home,
    },
    {
      title: 'JOB MATCHES',
      url: '/job-matches',
      icon: Briefcase,
    },
    {
      title: 'SAVED JOBS',
      url: '/saved-jobs',
      icon: Bookmark,
    },
    {
      title: 'PROFILE',
      url: '/user-profile',
      icon: User,
    },
  ];

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
                <span className="truncate font-black text-xl text-gray-800">
                  AICA
                </span>
                <span className="truncate text-xs font-bold uppercase text-gray-700">
                  AI CAREER ASSISTANT
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarMenu className="space-y-2">
            {navItems.map(item => (
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
      <SidebarFooter className="border-t border-gray-200 p-4">
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
  );
}

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <main className="flex flex-col gap-6 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
