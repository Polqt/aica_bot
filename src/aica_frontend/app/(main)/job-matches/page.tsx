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
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search jobs, companies, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50"
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
    </div>
  )
}