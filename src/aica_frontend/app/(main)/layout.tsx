'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  BriefcaseBusiness, 
  Bookmark, 
  User 
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  return (
    <div className="flex min-h-screen relative">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-screen p-4 z-10">
        <aside className="h-full bg-gradient-to-br from-blue-50 to-purple-100 dark:from-slate-800 dark:to-slate-900 backdrop-blur-sm shadow-lg rounded-lg flex flex-col">
          <div className="p-6 flex-shrink-0">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AICA</h1>
          </div>
          <nav className="mt-6 px-2 flex-1 overflow-y-auto space-y-2">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                pathname === '/dashboard'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              href="/job-matches"
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                pathname === '/job-matches'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BriefcaseBusiness className="w-5 h-5" />
              Job Matches
            </Link>
            <Link
              href="/saved-jobs"
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                pathname === '/saved-jobs'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-5 h-5" />
              Saved Jobs
            </Link>
            <Link
              href="/profile"
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                pathname === '/profile'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-5 h-5" />
              Profile
            </Link>
          </nav>
          
          {/* Theme Toggle at bottom of sidebar */}
          <div className="mt-auto p-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-center">
              <ThemeToggle />
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content with left margin to account for fixed sidebar */}
      <main className="flex-1 ml-64 relative z-10">
        <div className="p-8 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  )
}