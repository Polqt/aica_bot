'use client';

import { motion } from 'motion/react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Play, Brain, Target, Zap, Shield } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    step: 1,
    icon: Brain,
    title: 'AI-Powered Matching',
    description:
      'Advanced algorithms analyze your skills and preferences to find perfect job matches',
  },
  {
    step: 2,
    icon: Target,
    title: 'Precision Targeting',
    description:
      'Get matched with opportunities that align with your career goals and expertise',
  },
  {
    step: 3,
    icon: Zap,
    title: 'Instant Results',
    description:
      'Real-time job matching with immediate feedback and recommendations',
  },
  {
    step: 4,
    icon: Shield,
    title: 'Secure & Private',
    description:
      'Your data is protected with enterprise-grade security and privacy controls',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="relative overflow-hidden">
        <div className="relative container mx-auto px-6 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-block bg-violet-600 hover:bg-violet-400 hover:text-black text-white px-6 py-3 text-sm font-black uppercase tracking-wider transform -rotate-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-all hover:-translate-y-1 hover:translate-x-1">
                  AI-POWERED CAREERS
                </div>
              </motion.div>

              <div className="space-y-6">
                <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tight">
                  <span className="block text-gray-900 dark:text-white relative">
                    FIND YOUR
                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-black dark:bg-white transform -skew-x-12"></span>
                  </span>
                  <span className="block relative mt-4">
                    <span className="relative inline-block px-4 py-2 bg-violet-600 text-white transform -rotate-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)]">
                      DREAM JOB
                    </span>
                  </span>
                </h1>

                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-violet-600" />
                  <p className="text-xl text-gray-600 dark:text-gray-300 font-medium leading-relaxed pl-8">
                    Connect your resume with real job opportunities using AI. No
                    gimmicks, no guesswork—just personalized, intelligent job
                    matching designed for tech professionals like you.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button
                  asChild
                  className="group bg-violet-600 hover:bg-violet-400 hover:text-black text-white border-2 border-black dark:border-white px-10 py-6 text-lg font-black uppercase tracking-wide rounded-none transform transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                >
                  <Link href="/sign-up">
                    GET STARTED
                    <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>

                <Button
                  variant="neutral"
                  className="group border-2 border-black dark:border-white bg-background dark:bg-background text-foreground dark:text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground px-10 py-6 text-lg font-black uppercase tracking-wide rounded-none transform transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                >
                  <Play className="w-5 h-5 mr-3" />
                  WATCH DEMO
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-8">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 bg-violet-600 border-3 border-black dark:border-white text-white text-lg font-black transform hover:-translate-y-1 transition-all flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                    >
                      {i + 1}
                    </div>
                  ))}
                  <div className="w-14 h-14 bg-gray-200 dark:bg-gray-800 border-3 border-black dark:border-white text-black dark:text-white text-sm font-black transform hover:-translate-y-1 transition-all flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                    +10K
                  </div>
                </div>
                <div>
                  <p className="font-black text-gray-900 dark:text-white text-lg">
                    10,000+ PROFESSIONALS
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 font-semibold">
                    HAVE FOUND THEIR MATCH
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Demo Video */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="relative bg-background dark:bg-background border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] overflow-hidden transform rotate-1 hover:-translate-y-1 hover:translate-x-1 transition-all">
                <div className="bg-violet-600 dark:bg-violet-700 p-6 relative border-b-2 border-black dark:border-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-wide transform -rotate-1">
                        YOUR MATCHES
                      </h3>
                      <p className="text-violet-100 font-bold transform -rotate-1">
                        Perfect opportunities await
                      </p>
                    </div>
                    <div className="bg-white dark:bg-black px-4 py-2 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] transform -rotate-2">
                      <span className="text-black dark:text-white font-bold">
                        98% MATCH
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {[
                    {
                      company: 'TECHFLOW',
                      role: 'SENIOR REACT DEVELOPER',
                      match: '98%',
                      salary: '$120K - $150K',
                    },
                    {
                      company: 'INNOVATE CO',
                      role: 'FULL STACK ENGINEER',
                      match: '94%',
                      salary: '$100K - $130K',
                    },
                    {
                      company: 'DATACORE',
                      role: 'FRONTEND ARCHITECT',
                      match: '91%',
                      salary: '$110K - $140K',
                    },
                  ].map((job, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="group p-6 border-2 border-black dark:border-white bg-background dark:bg-background text-foreground dark:text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground transform transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-wide group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                            {job.role}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 font-bold text-sm uppercase tracking-wide">
                            {job.company}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                          {job.match}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-violet-600 dark:text-violet-400 font-bold">
                          {job.salary}
                        </span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-tight">
              <span className="block text-gray-900 dark:text-white">
                HOW TO USE
              </span>
              <span className="block relative mt-4">
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  AICA?
                </span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-2 bg-violet-600 transform skew-x-12" />
              </span>
            </h2>
            <div className="max-w-3xl mx-auto relative">
              <div className="absolute -left-6 top-0 w-2 h-full bg-gradient-to-b from-violet-600 to-purple-600 transform -skew-y-2" />
              <div className="absolute -right-2 top-4 w-4 h-4 bg-yellow-400 rotate-45" />
              <p className="text-2xl text-gray-700 dark:text-gray-300 font-bold pl-12 transform rotate-1 bg-white dark:bg-gray-900 py-6 px-8 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_theme(colors.violet.600)]">
                Experience the future of career matching with our revolutionary
                AI technology
              </p>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                viewport={{ once: true }}
                className="group"
              >
                <Card className="border-2 border-black dark:border-white bg-background dark:bg-background text-foreground dark:text-foreground hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground transform transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] overflow-hidden h-full rounded-none">
                  <CardContent className="p-8 relative">
                    <div className="absolute top-4 right-4 w-2 h-2 bg-violet-600 rounded-full" />
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black mb-4 uppercase tracking-wide text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 font-medium leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
