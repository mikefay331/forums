// src/components/LatestActivities.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LatestActivities() {
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLatestThreads()
    const interval = setInterval(loadLatestThreads, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadLatestThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('threads')
        .select(`
          *,
          author:users!author_id(username, level)
        `)
        .order('updated_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setThreads(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading latest activities:', error)
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getUsernameColor = (level: number) => {
    if (level >= 50) return 'text-purple-400'
    if (level >= 25) return 'text-red-400'
    if (level >= 10) return 'text-yellow-400'
    if (level >= 5) return 'text-cyan-400'
    return 'text-white'
  }

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
      <div className="bg-[#5865f2] px-4 py-2">
        <h3 className="text-white font-semibold text-sm">Latest Activity</h3>
      </div>

      <div className="divide-y divide-gray-800 max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="px-4 py-6 text-center text-gray-500 text-sm">Loading...</div>
        ) : threads.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500 text-sm">No threads yet</div>
        ) : (
          threads.map((thread) => (
            <Link key={thread.id} href={`/forum/thread/${thread.id}`} className="block px-4 py-3 hover:bg-[#252525] transition">
              <h4 className="text-white text-sm font-medium truncate mb-1">{thread.title}</h4>
              <div className="flex items-center justify-between text-xs">
                <span className={`font-semibold ${getUsernameColor(thread.author?.level || 1)}`}>
                  {thread.author?.username || 'Unknown'}
                </span>
                <span className="text-gray-500">{formatDate(thread.updated_at)}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>💬 {thread.replies_count || 0}</span>
                <span>👁️ {thread.views || 0}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {threads.length > 0 && (
        <div className="bg-[#252525] px-4 py-2 border-t border-gray-800">
          <Link href="/forum" className="text-[#5865f2] hover:underline text-xs font-semibold">
            View All Threads →
          </Link>
        </div>
      )}
    </div>
  )
}