// src/app/forum/[category]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const category = decodeURIComponent(params.category as string)

  useEffect(() => {
    loadThreads()
  }, [category])

  const loadThreads = async () => {
    setLoading(true)
    try {
      // Fetch threads with author data and posts count
      const { data, error } = await supabase
        . from('threads')
        .select(`
          *,
          author: users! author_id (
            id,
            username,
            avatar,
            level
          ),
          posts: posts(count)
        `)
        .eq('category', category)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending:  false })
        .limit(50)

      if (error) throw error

      // Transform data to include replies_count
      const threadsWithCounts = data?.map(thread => ({
        ...thread,
        replies_count:  thread.posts?.[0]?.count || 0
      })) || []

      setThreads(threadsWithCounts)
      setLoading(false)
    } catch (error) {
      console.error('Error loading threads:', error)
      setLoading(false)
    }
  }

  const getUsernameColor = (level: number) => {
    if (level >= 50) return 'text-purple-400'
    if (level >= 25) return 'text-red-400'
    if (level >= 10) return 'text-yellow-400'
    if (level >= 5) return 'text-cyan-400'
    return 'text-white'
  }

  const getAvatarUrl = (author: any) => {
    // TODO: Update this if you're storing avatars in Supabase Storage
    // For now, return null or update with your Supabase storage URL
    if (! author || !author.avatar) return null
    
    // If using Supabase Storage: 
    // return supabase.storage.from('avatars').getPublicUrl(author.avatar).data. publicUrl
    
    // If storing full URLs in the database:
    return author.avatar
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
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <Link href="/forum" className="text-[#5865f2] hover:underline text-sm mb-2 block">
              ← Back to Forum
            </Link>
            <h1 className="text-2xl font-bold text-white">{category}</h1>
          </div>
          {user && (
            <Link
              href={`/forum/${encodeURIComponent(category)}/new`}
              className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2 rounded font-semibold transition text-sm"
            >
              + New Thread
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading threads...</div>
        ) : threads.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded p-12 text-center">
            <p className="text-gray-400 mb-4">No threads in this category yet. </p>
            {user && (
              <Link
                href={`/forum/${encodeURIComponent(category)}/new`}
                className="inline-block bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2 rounded font-semibold transition"
              >
                Create First Thread
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#5865f2] text-white text-xs font-semibold uppercase">
              <div className="col-span-6">Thread</div>
              <div className="col-span-2 text-center">Author</div>
              <div className="col-span-2 text-center">Stats</div>
              <div className="col-span-2 text-right">Last Activity</div>
            </div>

            {/* Thread List */}
            <div className="divide-y divide-gray-800">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/forum/thread/${thread.id}`}
                  className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-[#252525] transition items-center"
                >
                  {/* Thread Title & Preview */}
                  <div className="col-span-6">
                    <div className="flex items-start gap-3">
                      {thread.is_pinned && (
                        <span className="text-yellow-400 text-lg flex-shrink-0">📌</span>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-white font-semibold hover:text-[#5865f2] transition truncate">
                          {thread.title}
                        </h3>
                        <p className="text-gray-500 text-sm truncate mt-1">
                          {thread.content?. substring(0, 100)}
                          {thread.content?.length > 100 && '... '}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <div className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {getAvatarUrl(thread.author) ? (
                        <img
                          src={getAvatarUrl(thread.author)!}
                          alt={thread. author?.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-xs font-semibold">
                          {thread.author?. username?. charAt(0).toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm truncate ${getUsernameColor(thread.author?.level || 1)}`}>
                        {thread.author?.username || 'Unknown'}
                      </p>
                      <p className="text-[#5865f2] text-xs">
                        LVL {thread.author?.level || 1}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div>
                        <p className="text-white font-semibold">{thread.replies_count || 0}</p>
                        <p className="text-gray-500 text-xs">Replies</p>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{thread. views || 0}</p>
                        <p className="text-gray-500 text-xs">Views</p>
                      </div>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="col-span-2 text-right">
                    <p className="text-gray-400 text-sm">{formatDate(thread.updated_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}