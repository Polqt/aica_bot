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
    <div className="relative min-h-screen flex flex-col items-center">
      <div className="relative z-10 w-full max-w-4xl px-6 py-12">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">
                Complete Your Profile
              </h1>
              <p className="text-base text-gray-600">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>

            <div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
              Complete
            </div>
          </div>

          <div className="mt-10 flex justify-center items-center gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.path} className="flex items-center">
                  {index > 0 && (
                    <div
                      className={`h-[2px] w-16 mx-2 ${
                        isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? 'bg-blue-600 text-white'
                          : isCurrent
                          ? 'bg-white border-2 border-blue-600 text-blue-600'
                          : 'bg-white border border-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isCompleted || isCurrent
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
