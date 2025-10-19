import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Video from './Video';

const features = [
  {
    iconSrc: '/Ai powered.svg',
    title: 'AI-Powered Matching',
    description:
      'Advanced algorithms analyze your skills and preferences to find perfect job matches',
  },
  {
    iconSrc: '/search wink.svg',
    title: 'Precision Targeting',
    description:
      'Get matched with opportunities that align with your career goals and expertise',
  },
  {
    iconSrc: '/results job.svg',
    title: 'Instant Results',
    description:
      'Real-time job matching with immediate feedback and recommendations',
  },
  {
    iconSrc: '/Protect.svg',
    title: 'Secure & Private',
    description:
      'Your data is protected with enterprise-grade security and privacy controls',
  },
];

export default function Hero() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-sm font-medium">
                <div className="w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
                AI-Powered Career Platform
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                FIND YOUR <br /> DREAM JOB WITH{' '}
                <span className="text-violet-600">INTELLIGENT MATCH</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                Connect your resume with real job opportunities using AI. No
                gimmicks, no guesswork, just personalized, intelligent job
                matching designed for tech professionals like you.
              </p>

              <div className="flex flex-wrap gap-4">
                <button onClick={handleGetStarted} className="group inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium transition-all duration-200">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                    >
                      {i}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-semibold">
                    +10K
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    10,000+ Professionals
                  </p>
                  <p className="text-xs text-gray-500">
                    have found their match
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Your Top Matches
                      </h3>
                      <p className="text-sm text-gray-600">
                        Personalized for you
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      98% Match
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {[
                    {
                      company: 'TechFlow',
                      role: 'Senior React Developer',
                      match: '98%',
                      salary: '$120K - $150K',
                    },
                    {
                      company: 'Innovate Co',
                      role: 'Full Stack Engineer',
                      match: '94%',
                      salary: '$100K - $130K',
                    },
                    {
                      company: 'DataCore',
                      role: 'Frontend Architect',
                      match: '91%',
                      salary: '$110K - $140K',
                    },
                  ].map((job, i) => (
                    <div
                      key={i}
                      className="group p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-violet-200 rounded-lg transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-violet-600 transition-colors">
                            {job.role}
                          </h4>
                          <p className="text-sm text-gray-600">{job.company}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                          {job.match}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-violet-600">
                          {job.salary}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Video />

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              HOW AICA WORKS
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our intelligent platform makes job searching simple and effective
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-violet-200 transition-all duration-300"
              >
                <div className="w-40 h-40 rounded-lg flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors mx-auto">
                  <Image
                    src={feature.iconSrc}
                    alt={feature.title}
                    width={250}
                    height={250}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
