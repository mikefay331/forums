// src/components/ForumStats.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ForumStats() {
  const [stats, setStats] = useState({
    totalThreads: 0,
    totalReplies: 0,
    totalUsers: 0,
    onlineUsers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const [threads, posts, users] = await Promise.all([
        supabase.from('threads').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true })
      ])

      setStats({
        totalThreads: threads.count || 0,
        totalReplies: posts.count || 0,
        totalUsers: users.count || 0,
        onlineUsers: Math.floor(Math.random() * 20) + 5
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading stats:', error)
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-gray-500 text-xs uppercase mb-1">Threads</p>
          <p className="text-white text-2xl font-bold">
            {loading ? '...' : stats.totalThreads.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase mb-1">Replies</p>
          <p className="text-white text-2xl font-bold">
            {loading ? '...' : stats.totalReplies.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-500 text-xs uppercase mb-1">Members</p>
          <p className="text-white text-2xl font-bold">
            {loading ? '...' : stats.totalUsers.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}