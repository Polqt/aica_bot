'use client'

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
    <div className="min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="fixed top-0 left-0 right-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              Complete Your Profile
            </h1>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          <div className="mt-4 flex items-center space-x-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.path} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isCompleted || isCurrent
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-colors ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="min-h-screen flex relative z-10 pt-24">{children}</div>
    </div>
  );
}
