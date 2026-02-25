// src/app/forum/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'

const CATEGORIES = [
  'Announcements',
  'Bitcoin Discussion',
  'Altcoin Discussion',  
  'Trading & Speculation',
  'Mining',
  'Technical Support',
  'Development & Technical',
  'Economy',
  'Marketplace',
  'Off-Topic',
  '$FORUMS Community',
  'Giveaways',
]

// Add your admin username(s) here
const ADMIN_USERNAMES = ['tet', 'admin', 'mikefay331']

const XP_REWARDS = {
  NEW_THREAD: 10,
  NEW_REPLY: 5
}

const calculateLevel = (xp: number) => {
  return Math.floor(xp / 100) + 1
}

export default function NewThreadPage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Bitcoin Discussion', // Default to non-announcement category
  })
  const [loading, setLoading] = useState(false)

  const isAdmin = user && (ADMIN_USERNAMES.includes(user.username) || user.role === 'admin')

  useEffect(() => {
    if (! user) {
      router.push('/login')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    // Check if user can post in selected category
    if ((formData.category === 'Announcements' || formData.category === 'Giveaways') && !isAdmin) {
      alert('⚠️ Only administrators can post in ' + formData.category)
      return
    }

    setLoading(true)
    try {
      // Create thread
      const { data: thread, error:  threadError } = await supabase
        .from('threads')
        .insert({
          title: formData.title,
          content: formData. content,
          category: formData.category,
          author_id: user.id,
          views: 0,
          likes: 0,
          is_pinned: false,
        })
        .select()
        .single()

      if (threadError) throw threadError

      // Update user stats
      const newXP = (user.experience || 0) + XP_REWARDS.NEW_THREAD
      const newLevel = calculateLevel(newXP)
      
      const { data: updated, error: updateError } = await supabase
        .from('users')
        .update({
          posts:  (user.posts || 0) + 1,
          experience: newXP,
          level: newLevel,
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      // Update local user state
      setUser(updated as any)
      
      alert(`Thread created! +${XP_REWARDS.NEW_THREAD} XP`)
      router.push(`/forum/thread/${thread.id}`)
    } catch (error:  any) {
      console.error('Error creating thread:', error)
      alert('Failed to create thread:  ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/forum" className="text-[#5865f2] hover:underline text-sm mb-2 block">
            ← Back to Forum
          </Link>
          <h1 className="text-2xl font-bold text-white">Create New Thread</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
          <div className="bg-[#5865f2] px-6 py-3">
            <h2 className="text-white font-semibold">NEW THREAD (+{XP_REWARDS.NEW_THREAD} XP)</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Category
              </label>
              <select
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
                value={formData. category}
                onChange={(e) => setFormData({ ... formData, category: e.target.value })}
                required
              >
                {CATEGORIES.map((cat) => {
                  const isLocked = (cat === 'Announcements' || cat === 'Giveaways') && !isAdmin
                  return (
                    <option 
                      key={cat} 
                      value={cat}
                      disabled={isLocked}
                    >
                      {cat}{isLocked ? ' 🔒 (Admin Only)' : ''}
                    </option>
                  )
                })}
              </select>
              {(formData.category === 'Announcements' || formData.category === 'Giveaways') && !isAdmin && (
                <p className="text-yellow-400 text-xs mt-2">
                  ⚠️ Only administrators can post in {formData.category}. Please select a different category.
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Thread Title
              </label>
              <input
                type="text"
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2]"
                value={formData. title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter thread title..."
                required
                maxLength={200}
              />
              <p className="text-gray-500 text-xs mt-1">
                {formData. title.length}/200 characters
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Content
              </label>
              <textarea
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] font-mono"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your thread content..."
                required
                rows={12}
              />
              <p className="text-gray-500 text-xs mt-1">
                {formData.content.length} characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <button
                type="submit"
                disabled={loading || ((formData.category === 'Announcements' || formData.category === 'Giveaways') && !isAdmin)}
                className="flex-1 bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-semibold transition"
              >
                {loading ?  'Creating Thread...' : `Create Thread (+${XP_REWARDS.NEW_THREAD} XP)`}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded font-semibold transition border border-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded p-4 mt-4">
          <h3 className="text-white font-semibold mb-2 text-sm">📝 Thread Tips</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Choose the right category for better visibility</li>
            <li>• Use a clear and descriptive title</li>
            <li>• Be respectful and follow community guidelines</li>
            <li>• You'll earn {XP_REWARDS.NEW_THREAD} XP for creating a thread</li>
            {!isAdmin && <li>• 🔒 Only admins can post in Announcements or Giveaways</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}