'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserProfile } from '@/types/user'

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch('http://localhost:8000/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }

        const data = await response.json()
        setUser(data)
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-gray-900 dark:text-white">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-600 dark:text-red-400">{error}</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen text-gray-900 dark:text-white">No user data</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account information.</p>
      </div>

      <div className="glass-card border-0 shadow-2xl p-8">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{user.email}</h2>
            <p className="text-gray-600 dark:text-gray-400">Member since {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <p className="text-gray-900 dark:text-white bg-gray-50/50 dark:bg-slate-800/50 backdrop-blur-sm px-3 py-2 rounded border border-gray-200 dark:border-slate-700">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Created</label>
            <p className="text-gray-900 dark:text-white bg-gray-50/50 dark:bg-slate-800/50 backdrop-blur-sm px-3 py-2 rounded border border-gray-200 dark:border-slate-700">
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
            </p>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <button className="btn-modern px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg">
            Edit Profile
          </button>
          <button className="btn-modern px-4 py-2 bg-gray-200/50 dark:bg-slate-700/50 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300/50 dark:hover:bg-slate-600/50 backdrop-blur-sm border border-gray-300 dark:border-slate-600">
            Change Password
          </button>
        </div>
      </div>
    </div>
  )
}