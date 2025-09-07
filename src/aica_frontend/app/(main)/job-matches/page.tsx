'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Filter,
  Search,
  TrendingUp,
} from 'lucide-react'

export default function JobMatchesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')

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
            Job Matches
          </h1>
          <p className="text-muted-foreground mt-2">
            Filter jobs that match your profile and preferences
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="btn-modern">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button className="btn-modern bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            Improve Matches
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col lg:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10" />
          <Input
            placeholder="Search jobs, companies, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50 relative z-0"
          />
        </div>

        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All Jobs' },
            { value: 'urgent', label: 'Urgent' },
            { value: 'remote', label: 'Remote' }
          ].map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'default' : 'outline'}
              onClick={() => setFilter(option.value)}
              className="btn-modern"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </motion.div>

      <div className="space-y-6">
      </div>

      {/* Two-Section Layout: Job Matches Left + Job Description Right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-7xl mx-auto grid grid-cols-5 gap-6 h-[calc(100vh-200px)]"
      >
        {/* Left Column - Job List */}
        <div className="col-span-2 rounded-[25px] glass-card overflow-y-auto p-6">
          {/* Update Button */}
          <div className="mb-4">
            <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Update Matches
            </button>
          </div>

          {/* Job List */}
          <div className="space-y-4">
            <div className="p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 cursor-pointer hover:bg-background/70 transition-all duration-300 hover:shadow-md">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Senior Software Engineer
              </h3>
              <p className="text-muted-foreground mb-2">
                Tech Innovations Inc.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  95% Match
                </span>
                <span className="text-sm text-muted-foreground">
                  $80,000 - $120,000
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-border/50 cursor-pointer hover:bg-background/70 transition-all duration-300 hover:shadow-md">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Frontend Developer
              </h3>
              <p className="text-muted-foreground mb-2">
                Design Studio LLC
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                  88% Match
                </span>
                <span className="text-sm text-muted-foreground">
                  $65,000 - $90,000
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
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  82% Match
                </span>
                <span className="text-sm text-muted-foreground">
                  $70,000 - $100,000
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
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  79% Match
                </span>
                <span className="text-sm text-muted-foreground">
                  $75,000 - $110,000
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
                <span className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                  76% Match
                </span>
                <span className="text-sm text-muted-foreground">
                  $85,000 - $125,000
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
                Senior Software Engineer
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  🏢 Tech Innovations Inc.
                </span>
                <span className="flex items-center gap-2">
                  📍 San Francisco, CA
                </span>
                <span className="flex items-center gap-2">
                  💰 $80,000 - $120,000
                </span>
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                  ✨ 95% Match
                </span>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Job Description
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We are seeking a talented Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining high-quality software solutions that power our cutting-edge products. This role offers an excellent opportunity to work with modern technologies and contribute to innovative projects.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                As a Senior Software Engineer, you will collaborate with cross-functional teams, mentor junior developers, and play a key role in architectural decisions. We value creativity, technical excellence, and a passion for building exceptional user experiences.
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
                  Bachelor's degree in Computer Science or related field
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  5+ years of experience in software development
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Proficiency in JavaScript, Python, and React
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Experience with cloud platforms (AWS, Azure, or GCP)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  Strong problem-solving and communication skills
                </li>
              </ul>
            </div>

            {/* Skills Match */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Skills Match
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">JavaScript</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">95%</span>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                </div>
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
                    <span className="text-sm text-muted-foreground">Python</span>
                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400">75%</span>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">AWS</span>
                    <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">60%</span>
                  </div>
                  <div className="w-full bg-background/50 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white">
                Apply Now
              </Button>
              <Button variant="outline" className="px-6 py-3">
                Save Job
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}