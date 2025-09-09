import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { appInfo } from '@/lib/constants/app-data';
import { Brain, Target, Users, Zap } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description: "Advanced machine learning algorithms analyze your skills and match you with perfect opportunities."
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Get matched with jobs that truly align with your skills, experience, and career goals."
    },
    {
      icon: Users,
      title: "Student-Focused",
      description: "Specifically designed for technology graduates and recent graduates entering the job market."
    },
    {
      icon: Zap,
      title: "Efficient Process",
      description: "Streamlined application process that saves time and increases your chances of success."
    }
  ];

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 text-center">
      {/* Main About Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-slate-800 dark:text-slate-100">
          About {appInfo.name}
        </h1>
        
        {/* Image/Video Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="glass-card-enhanced max-w-4xl mx-auto aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-300 dark:bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium">Image/Video Placeholder</p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">Demo or promotional content</p>
            </div>
          </div>
        </motion.div>
        
        <Card className="glass-card-enhanced max-w-4xl mx-auto">
          <CardContent className="p-8">
            <div className="space-y-6 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                <strong className="text-slate-800 dark:text-slate-100">AI Career Assistant (AICA)</strong> is a revolutionary job-matching platform
                that combines Large Language Models (LLMs) with Retrieval-Augmented
                Generation (RAG). It seeks to close the gap between the skills of
                technology graduates and the requirements of today's job
                market.
              </p>
              
              <p>
                Through a structured resume process and AI-driven job matching,
                AICA helps graduating students and recent graduates present their skills
                more effectively and discover opportunities that match their strengths
                and aspirations.
              </p>
              
              <p>
                This research addresses the shortcomings of
                conventional job portals by offering an intelligent, user-centered
                system that promotes more accurate and efficient job matching in the
                technology sector.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-100">
          What Makes AICA Special
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card-enhanced hover:scale-105 transition-transform duration-300 flex flex-col justify-center">
                <CardContent className="p-5 text-center flex flex-col items-center justify-center">
                  <motion.div 
                    className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-3 shadow-lg dark:shadow-none"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-100">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mission Statement */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-20"
      >
        <Card className="glass-card-enhanced max-w-3xl mx-auto">
          <CardContent className="p-8">
            <motion.h2 
              className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Our Mission
            </motion.h2>
            <motion.p 
              className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              To revolutionize the job search experience by leveraging cutting-edge artificial intelligence 
              to match talented individuals with their ideal career opportunities. We believe that finding the right job 
              should be intuitive, efficient, and personalized to each individual's unique skills and aspirations.
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
