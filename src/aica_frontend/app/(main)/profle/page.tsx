'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  created_at: string | null
}

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
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">No user data</div>
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">ID</label>
          <p className="mt-1 text-sm text-gray-900">{user.id}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Created At</label>
          <p className="mt-1 text-sm text-gray-900">
            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
          </p>
        </div>
      </div>
    </div>
  )
}