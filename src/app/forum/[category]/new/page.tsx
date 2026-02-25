// src/app/forum/[category]/new/page.tsx
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'

const ADMIN_USERNAMES = ['tet', 'admin', 'mikefay331']

export default function NewThreadPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const category = decodeURIComponent(params.category as string)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isAdmin = user && (ADMIN_USERNAMES.includes(user.username) || user.role === 'admin')

  // Check if user can post in this category
  const canPostInCategory = () => {
    if (category === 'Announcements' || category === 'Giveaways') {
      return isAdmin
    }
    return true // All users can post in other categories
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('Please login to create a thread')
      router.push('/login')
      return
    }

    // Double-check permissions
    if (!canPostInCategory()) {
      alert('Only admins can post in ' + category)
      return
    }

    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields')
      return
    }

    setSubmitting(true)

    try {
      // Create thread
      const { data: thread, error: threadError } = await supabase
        .from('threads')
        .insert({
          title: title.trim(),
          content: content.trim(),
          category,
          author_id: user.id,
          views: 0,
          likes: 0,
        })
        .select()
        .single()

      if (threadError) throw threadError

      // Award XP for creating thread
      const { error: updateError } = await supabase
        .from('users')
        .update({
          experience: (user.experience || 0) + 10,
          posts: (user.posts || 0) + 1,
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Failed to update user XP:', updateError)
        // Don't block thread creation if XP update fails
      }

      router.push(`/forum/thread/${thread.id}`)
    } catch (error) {
      console.error('Error creating thread:', error)
      alert('Failed to create thread')
      setSubmitting(false)
    }
  }

  // Show error if user can't post
  if (!canPostInCategory()) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <div className="bg-[#1a1a1a] border-b border-gray-800 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-white">Access Denied</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-600/30 rounded p-6">
            <p className="text-red-400 text-lg">
              ⚠️ Only administrators can post in the {category} forum.
            </p>
            <button
              onClick={() => router.push('/forum')}
              className="mt-4 bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2 rounded font-semibold"
            >
              ← Back to Forum
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">
            Create New Thread in {category}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
          <div className="bg-[#5865f2] px-6 py-3">
            <h2 className="text-white font-semibold">NEW THREAD</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Thread Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter thread title..."
                maxLength={200}
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2]"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your post..."
                rows={12}
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2]"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-gray-600 text-white px-6 py-3 rounded font-semibold transition"
              >
                {submitting ? 'Creating...' : 'Create Thread'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}