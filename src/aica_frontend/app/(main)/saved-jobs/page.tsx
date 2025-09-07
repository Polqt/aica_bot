'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import {
  Filter,
  Search,
} from 'lucide-react';

export default function SavedJobsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold gradient-text">
            Saved Jobs
          </h1>
          <p className="text-muted-foreground mt-2">
            Filter jobs saved for later • Keep track of opportunities
            you&apos;re interested in
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="btn-modern">
            <Filter className="w-4 h-4 mr-2" />
            Sort by
          </Button>
          <Button className="btn-modern bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Search className="w-4 h-4 mr-2" />
            Find New Jobs
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
        <input
          type="text"
          placeholder="Search saved jobs..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background/50 backdrop-blur-sm border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 relative z-0"
        />
      </motion.div>

      <div className="space-y-6"></div>

      {/* Two-Section Layout: Saved Jobs Left + Job Details Right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-7xl mx-auto grid grid-cols-5 gap-6 h-[calc(100vh-200px)]"
      >
        {/* Left Column - Saved Jobs List */}
        <div className="col-span-2 rounded-[25px] glass-card overflow-y-auto p-6">
          {/* Saved Jobs List */}
          <div className="space-y-4">
            <div className="p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 cursor-pointer hover:bg-background/70 transition-all duration-300 hover:shadow-md">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Frontend Developer
              </h3>
              <p className="text-muted-foreground mb-2">
                Design Studio LLC
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Saved 2 days ago
                </span>
                <span className="text-sm text-muted-foreground">
                  $65,000 - $90,000
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 cursor-pointer hover:bg-background/70 transition-all duration-300 hover:shadow-md">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Senior Software Engineer
              </h3>
              <p className="text-muted-foreground mb-2">
                Tech Innovations Inc.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Saved 1 week ago
                </span>
                <span className="text-sm text-muted-foreground">
                  $80,000 - $120,000
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 cursor-pointer hover:bg-background/70 transition-all duration-300 hover:shadow-md">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Full Stack Developer
              </h3>
              <p className="text-muted-foreground mb-2">
                StartupXYZ
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Saved 1 week ago
                </span>
                <span className="text-sm text-muted-foreground">
                  $70,000 - $100,000
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 cursor-pointer hover:bg-background/70 transition-all duration-300 hover:shadow-md">
              <h3 className="text-lg font-medium text-foreground mb-2">
                DevOps Engineer
              </h3>
              <p className="text-muted-foreground mb-2">
                Infrastructure Corp
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Saved 2 weeks ago
                </span>
                <span className="text-sm text-muted-foreground">
                  $85,000 - $125,000
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 cursor-pointer hover:bg-background/70 transition-all duration-300 hover:shadow-md">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Backend Engineer
              </h3>
              <p className="text-muted-foreground mb-2">
                CloudTech Solutions
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Saved 3 weeks ago
                </span>
                <span className="text-sm text-muted-foreground">
                  $75,000 - $110,000
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Job Description/Details */}
        <div className="col-span-3 border border-border/30 rounded-[25px] glass-card shadow-lg p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Job Header */}
            <div className="border-b border-border/50 pb-4">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Frontend Developer
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  🏢 Design Studio LLC
                </span>
                <span className="flex items-center gap-2">
                  📍 New York, NY
                </span>
                <span className="flex items-center gap-2">
                  💰 $65,000 - $90,000
                </span>
                <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                  💾 Saved 2 days ago
                </span>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Job Description
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Join our creative team as a Frontend Developer where you'll bring beautiful designs to life. You'll work with modern frameworks and collaborate with designers and backend developers to create exceptional user experiences that delight our customers.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We're looking for someone passionate about clean code, responsive design, and staying up-to-date with the latest frontend technologies. This is a great opportunity to work on exciting projects in a collaborative environment.
              </p>
            </div>

            {/* Requirements */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Requirements
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  3+ years of experience with React and modern JavaScript
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Strong knowledge of CSS, HTML5, and responsive design
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Experience with version control (Git) and build tools
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Understanding of UX/UI principles and design systems
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Excellent communication and teamwork skills
                </li>
              </ul>
            </div>

            {/* Skills Assessment */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Skills Assessment
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">React</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">90%</span>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">CSS/HTML</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">95%</span>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">JavaScript</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">88%</span>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '88%'}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">UI/UX Design</span>
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">70%</span>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '70%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white">
                Apply Now
              </Button>
              <Button variant="destructive" className="px-6 py-3">
                Remove from Saved
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
