'use client';

import { usePathname } from 'next/navigation';
import { User, GraduationCap, Briefcase, Zap } from 'lucide-react';
import Footer from '@/components/Footer';

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
    <div className="relative min-h-screen flex flex-col items-center justify-between bg-grid-pattern">
      <div className="w-full max-w-5xl px-6 py-10">
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200/60 rounded-2xl shadow-sm mb-10 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Complete Your Profile
              </h1>
              <p className="text-sm text-gray-600 font-medium mt-1">
                Step {currentStepIndex + 1} of {steps.length}
              </p>
            </div>

            <div className="px-4 py-2 bg-violet-100 text-violet-700 font-semibold text-sm rounded-lg">
              {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
              Complete
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.path} className="text-center">
                  <div
                    className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : isCurrent
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
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

        <div className="relative z-10">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
