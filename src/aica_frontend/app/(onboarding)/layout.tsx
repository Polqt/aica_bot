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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-8">
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Complete Your Profile
                  </h1>
                  <p className="text-gray-600 font-medium mt-1">
                    Step {currentStepIndex + 1} of {steps.length}
                  </p>
                </div>
                <div className="bg-violet-100 text-violet-700 px-4 py-2 rounded-lg font-semibold text-sm">
                  {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% Complete
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step.path} className="text-center">
                      <div className="relative">
                        <div
                          className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center transition-all duration-300 ${
                            isCompleted
                              ? 'bg-green-500 text-white shadow-sm'
                              : isCurrent
                              ? 'bg-violet-600 text-white shadow-sm'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        {isCompleted && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <h3
                        className={`mt-3 text-sm font-semibold ${
                          isCompleted || isCurrent
                            ? 'text-gray-900'
                            : 'text-gray-500'
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

          {/* Main Content */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
