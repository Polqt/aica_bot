'use client'

import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Target,
  Clock,
  ArrowRight,
  FileText,
  Star
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
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
            Welcome back, Alex! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s your job search overview and latest matches
          </p>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline" className="btn-modern">
            <Link href="/profile">
              Update Profile
            </Link>
          </Button>
          <Button asChild className="btn-modern bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link href="/job-matches">
              View All Matches
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Recent Job Matches
              </CardTitle>
              <CardDescription>
                Jobs that match your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-4">
                <Button asChild variant="outline" className="w-full btn-modern">
                  <Link href="/job-matches">
                    View All Matches
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest job search activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to boost your job search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="btn-modern h-auto p-4 flex-col gap-2">
                <Link href="/profile">
                  <FileText className="w-6 h-6" />
                  <span>Update Resume</span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="btn-modern h-auto p-4 flex-col gap-2">
                <Link href="/saved-jobs">
                  <Star className="w-6 h-6" />
                  <span>View Saved Jobs</span>
                </Link>
              </Button>

              <Button asChild variant="outline" className="btn-modern h-auto p-4 flex-col gap-2">
                <Link href="/job-matches">
                  <Target className="w-6 h-6" />
                  <span>Explore Matches</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
