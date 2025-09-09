'use client'

import { Navbar } from '@/components/Navbar';
import Paper from '@/components/Paper';
import Testimony from '@/components/Testimony';
import React from 'react';
import { motion } from 'motion/react';

export default function PaperPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="flex flex-col items-center justify-center px-4 py-8">
        {/* Paper Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl mx-auto mt-8"
        >
          <Paper />
        </motion.div>

        {/* Testimonials Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-6xl mx-auto mt-20"
        >
          <Testimony />
        </motion.div>
      </div>
    </div>
  );
}
