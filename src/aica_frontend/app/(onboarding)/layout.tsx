'use client';

import { usePathname } from 'next/navigation';
import { User, GraduationCap, Briefcase, Zap } from 'lucide-react';

const steps = [
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/education', label: 'Education', icon: GraduationCap },
  { path: '/experience', label: 'Experience', icon: Briefcase },
  { path: '/skills', label: 'Skills', icon: Zap },
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStepIndex = steps.findIndex(step => step.path === pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50 dark:from-gray-950 dark:to-violet-950/20">
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_40px,transparent_40px),linear-gradient(to_bottom,#e4e4e7_40px,transparent_40px)] dark:bg-[linear-gradient(to_right,#262626_40px,transparent_40px),linear-gradient(to_bottom,#262626_40px,transparent_40px)]" />
      </div>
      <div className="relative z-20 container mx-auto px-6 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-gray-900/10 dark:shadow-black/40 border-4 border-black dark:border-white overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-white uppercase tracking-wider">
                  COMPLETE YOUR PROFILE
                </h1>
                <p className="text-violet-100 font-bold text-lg mt-2">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border-2 border-white/30">
                <span className="text-white font-black text-xl">
                  {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% COMPLETE
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.path} className="text-center">
                    <div className="relative">
                      <div
                        className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center border-4 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-green-500 border-green-600 text-white shadow-xl shadow-green-500/25'
                            : isCurrent
                            ? 'bg-violet-600 border-violet-700 text-white shadow-xl shadow-violet-500/25 animate-pulse'
                            : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        <Icon className="w-8 h-8" />
                      </div>
                      {isCompleted && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full flex items-center justify-center">
                          <span className="text-white font-black text-sm">✓</span>
                        </div>
                      )}
                    </div>
                    <h3
                      className={`mt-4 text-lg font-black uppercase tracking-wide ${
                        isCompleted || isCurrent
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-1 gap-8">
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl shadow-gray-900/10 dark:shadow-black/40 border-4 border-black dark:border-white overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
