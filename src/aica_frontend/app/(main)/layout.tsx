'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Target,
  Bookmark,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Bell,
  Search,
  ChevronDown,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null,
    description: 'Overview and analytics',
  },
  {
    name: 'Job Matches',
    href: '/job-matches',
    icon: Target,
    badge: '5',
    description: 'AI-powered job recommendations',
  },
  {
    name: 'Saved Jobs',
    href: '/saved-jobs',
    icon: Bookmark,
    badge: '12',
    description: 'Your bookmarked positions',
  },
  {
    name: 'Profile',
    href: '/user-profile',
    icon: User,
    badge: null,
    description: 'Manage your information',
  },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true); // Default to true for SSR

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/50 dark:from-slate-900 dark:via-slate-800/50 dark:to-violet-900/20 flex">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-violet-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-80 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-600/10 rounded-full blur-3xl animate-pulse delay-2000" />
          <div className="absolute inset-0 bg-grid-slate-100/50 dark:bg-grid-slate-700/25 bg-[size:20px_20px] [mask-image:radial-gradient(white,transparent_70%)]" />
        </div>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className="fixed inset-y-0 left-0 z-50 w-80 lg:relative lg:z-auto lg:block">
          <motion.div
            initial={false}
            animate={{
              x: isDesktop ? 0 : sidebarOpen ? 0 : '-100%',
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="h-full lg:translate-x-0 lg:!transform-none lg:static"
          >
            <div className="drawer-side h-full">
              <div className="min-h-full w-80 card-glass shadow-2xl sidebar-scroll overflow-y-auto">
              <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
                <div className="flex h-20 items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-700/50">
                  <motion.div
                    className="flex items-center space-x-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 sidebar-active-glow">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div className="badge badge-success badge-xs absolute -top-1 -right-1 animate-pulse"></div>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 bg-clip-text text-transparent">
                        AICA
                      </h1>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        AI Career Assistant
                      </p>
                    </div>
                  </motion.div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 btn-circle btn-sm"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Quick Actions Bar */}
                <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center space-x-2">
                    <div className="form-control flex-1">
                      <div className="input-group">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 justify-start bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 input input-sm input-bordered"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Quick Search
                        </Button>
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 btn-circle btn-sm"
                        >
                          <Bell className="w-4 h-4" />
                          <div className="badge badge-error badge-xs absolute -top-1 -right-1">
                            3
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>3 new notifications</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Enhanced Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2 menu">
                <div className="mb-6">
                  <div className="menu-title">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Main Menu
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {navigation.map((item, index) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;

                      return (
                        <Tooltip key={item.name}>
                          <TooltipTrigger asChild>
                            <motion.li
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="sidebar-nav-item"
                            >
                              <Link
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`menu-item group relative flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                                  isActive
                                    ? 'active bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-700/50 shadow-lg shadow-violet-500/10'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-100/80 hover:to-slate-50/80 dark:hover:from-slate-700/50 dark:hover:to-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                {/* Active indicator */}
                                {isActive && (
                                  <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-purple-600 rounded-r-full"
                                    initial={false}
                                    transition={{
                                      type: 'spring',
                                      stiffness: 500,
                                      damping: 30,
                                    }}
                                  />
                                )}

                                <Icon
                                  className={`mr-3 h-5 w-5 transition-all duration-200 ${
                                    isActive
                                      ? 'text-violet-600 dark:text-violet-400 scale-110'
                                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:scale-105'
                                  }`}
                                />

                                <span className="flex-1">{item.name}</span>

                                {/* Badge */}
                                {item.badge && (
                                  <div
                                    className={`badge badge-sm ${
                                      isActive
                                        ? 'badge-primary bg-violet-100 text-violet-600 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700'
                                        : 'badge-ghost bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {item.badge}
                                  </div>
                                )}

                                {/* Glow effect on active */}
                                {isActive && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute right-3 w-2 h-2 bg-violet-500 rounded-full shadow-lg shadow-violet-500/50"
                                  />
                                )}
                              </Link>
                            </motion.li>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </ul>
                </div>

                <div className="divider"></div>

                {/* AI Assistant Section */}
                <div className="space-y-2">
                  <div className="menu-title">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      AI Assistant
                    </span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="card card-compact bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-blue-900/20 shadow-md mx-2">
                      <div className="card-body">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="avatar">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                              <Zap className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              Career Coach
                            </p>
                            <div className="flex items-center space-x-1">
                              <div className="badge badge-success badge-xs"></div>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Online
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                          Get personalized career advice and job recommendations
                        </p>
                        <Button size="sm" className="w-full btn-gradient">
                          Chat Now
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </nav>

              {/* Enhanced Footer */}
              <div className="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 p-4">
                {/* User Profile Section */}
                <div className="dropdown dropdown-top dropdown-end w-full">
                  <motion.div
                    tabIndex={0}
                    role="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl card-glass hover:shadow-lg transition-all duration-200 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="avatar online">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        John Doe
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="badge badge-primary badge-xs">PRO</div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          Premium Member
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                        userMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.div>

                  {/* User Menu Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        tabIndex={0}
                        className="dropdown-content menu bg-white dark:bg-slate-800 rounded-box z-[1] w-full p-2 shadow-xl border border-slate-200 dark:border-slate-700 backdrop-blur-xl"
                      >
                        <li>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Button>
                        </li>
                        <div className="divider my-1"></div>
                        <li>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                          </Button>
                        </li>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
          </motion.div>
        </div>

        {/* Enhanced Mobile Header */}
        <div className="lg:hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-3 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </Button>

            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                AICA
              </h1>
            </motion.div>

            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="lg:pl-80 transition-all duration-300">
          <div className="px-4 py-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </TooltipProvider>
  );
}
