import Link from 'next/link'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          <nav className="mt-6 px-2 flex-1 overflow-y-auto">
            <Link
              href="/dashboard"
              className="block px-4 py-3 mx-2 text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all duration-200"
            >
              Dashboard
            </Link>
            <Link
              href="/job-matches"
              className="block px-4 py-3 mx-2 text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all duration-200"
            >
              Job Matches
            </Link>
            <Link
              href="/saved-jobs"
              className="block px-4 py-3 mx-2 text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all duration-200"
            >
              Saved Jobs
            </Link>
            <Link
              href="/profile"
              className="block px-4 py-3 mx-2 text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all duration-200"
            >
              Profile
            </Link>
          </nav>
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