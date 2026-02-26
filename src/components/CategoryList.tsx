// src/components/CategoryList.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const CATEGORIES = [
  { name: 'Announcements', icon: '📢', description: 'Official news and updates from the $FORUMS team' },
  { name: 'Bitcoin Discussion', icon: '₿', description: 'Everything Bitcoin — price, technology, and adoption' },
  { name: 'Altcoin Discussion', icon: '🪙', description: 'Talk altcoins, new projects, and hidden gems' },
  { name: 'Trading & Speculation', icon: '📈', description: 'TA, market calls, strategies, and price speculation' },
  { name: 'Mining', icon: '⛏️', description: 'Mining hardware, software, pools, and profitability' },
  { name: 'Technical Support', icon: '🔧', description: 'Get help with wallets, exchanges, and crypto tools' },
  { name: 'Development & Technical', icon: '💻', description: 'Blockchain dev, smart contracts, and open source builds' },
  { name: 'Economy', icon: '💰', description: 'Macro economics, regulation, and global crypto adoption' },
  { name: 'Marketplace', icon: '🛒', description: 'Buy, sell, and trade crypto goods and services' },
  { name: 'Off-Topic', icon: '💬', description: 'Anything goes — non-crypto talk and general discussion' },
  { name: '$FORUMS Community', icon: '🎯', description: 'Community suggestions, feedback, and $FORUMS token talk' },
  { name: 'Giveaways', icon: '🎁', description: 'Token giveaways, contests, and community rewards' },
]

export default function CategoryList() {
  const [categoryStats, setCategoryStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategoryStats()
  }, [])

  const loadCategoryStats = async () => {
    try {
      const { data: allThreads, error } = await supabase
        .from('threads')
        .select('*, author:users!author_id(id, username, avatar)')
        .order('updated_at', { ascending: false })
        .limit(500)

      if (error) throw error

      // Group by category
      const stats: any = {}
      
      CATEGORIES.forEach(cat => {
        const categoryThreads = (allThreads || []).filter((t: any) => t.category === cat.name)
        const latestThread = categoryThreads[0]
        
        stats[cat.name] = {
          threadCount: categoryThreads.length,
          postCount: categoryThreads.reduce((sum: number, t: any) => sum + (t.replies_count || 0), 0) + categoryThreads.length,
          latestThread: latestThread || null
        }
      })

      setCategoryStats(stats)
      setLoading(false)
    } catch (error) {
      console.error('Error loading category stats:', error)
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

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#5865f2] text-white text-xs font-semibold uppercase">
        <div className="col-span-6">Forum</div>
        <div className="col-span-2 text-center">Threads</div>
        <div className="col-span-2 text-center">Posts</div>
        <div className="col-span-2 text-right">Last Post</div>
      </div>

      {/* Categories */}
      <div className="divide-y divide-gray-800">
        {CATEGORIES.map((category) => {
          const stats = categoryStats[category.name] || { threadCount: 0, postCount: 0, latestThread: null }
          
          return (
            <Link
              key={category.name}
              href={`/forum/${encodeURIComponent(category.name)}`}
              className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-[#252525] transition items-center"
            >
              {/* Category Name & Description */}
              <div className="col-span-6 flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="text-white font-semibold">{category.name}</h3>
                  <p className="text-gray-500 text-sm">{category.description}</p>
                </div>
              </div>

              {/* Thread Count */}
              <div className="col-span-2 text-center">
                <p className="text-white font-bold text-lg">
                  {loading ? '...' : stats.threadCount.toLocaleString()}
                </p>
              </div>

              {/* Post Count */}
              <div className="col-span-2 text-center">
                <p className="text-white font-bold text-lg">
                  {loading ? '...' : stats.postCount.toLocaleString()}
                </p>
              </div>

              {/* Last Post */}
              <div className="col-span-2 text-right">
                {stats.latestThread ? (
                  <div>
                    <p className="text-white text-sm font-medium truncate">
                      {stats.latestThread.title}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      by {stats.latestThread.author?.username || 'Unknown'}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {formatDate(stats.latestThread.updated_at)}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">No posts yet</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}