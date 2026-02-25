// src/app/forum/thread/[id]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'

export default function ThreadPage() {
  const params = useParams()
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [thread, setThread] = useState<any>(null)
  const [replies, setReplies] = useState<any[]>([])
  const [replyContent, setReplyContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (params.id) {
      loadThread()
    }
  }, [params.id])

  const loadThread = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('Loading thread ID:', params.id)
      
      // Fetch thread with author data
      const { data: threadData, error: threadError } = await supabase
        .from('threads')
        .select(`
          *,
          author:  users! author_id (
            id,
            username,
            avatar,
            level
          )
        `)
        .eq('id', params.id)
        .single()

      if (threadError) throw threadError

      console.log('Thread loaded successfully:', threadData)

      // Update views (increment by 1)
      try {
        await supabase
          .from('threads')
          .update({ views: (threadData. views || 0) + 1 })
          .eq('id', params.id)
      } catch (viewError) {
        console.log('Could not update views:', viewError)
      }

      setThread(threadData)

      // Fetch replies (posts) with author data
      const { data:  repliesData, error: repliesError } = await supabase
        .from('posts')
        .select(`
          *,
          author: users! author_id (
            id,
            username,
            avatar,
            level
          )
        `)
        .eq('thread_id', params.id)
        .order('created_at', { ascending: true })

      if (repliesError) throw repliesError

      console.log('Replies loaded:', repliesData?. length || 0)
      setReplies(repliesData || [])
      setLoading(false)
    } catch (error:  any) {
      console.error('Error loading thread:', error)
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      setError(error.message || 'Failed to load thread')
      setLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !replyContent. trim()) return

    try {
      // Create reply (post)
      const { error:  replyError } = await supabase
        .from('posts')
        .insert({
          content: replyContent,
          author_id: user.id,
          thread_id: params.id,
          likes: 0
        })

      if (replyError) throw replyError

      // Update user XP and stats
      const newXP = (user.experience || 0) + 5
      const newLevel = Math.floor(newXP / 100) + 1

      const { data: updatedUser, error: updateError } = await supabase
        . from('users')
        .update({
          experience: newXP,
          level: newLevel,
          posts:  (user.posts || 0) + 1
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        console.error('Failed to update user XP:', updateError)
      } else {
        setUser(updatedUser as any)
      }

      setReplyContent('')
      loadThread()
      alert('Reply posted!  +5 XP')
    } catch (error: any) {
      console.error('Error:', error)
      alert('Failed to post reply:  ' + error.message)
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
    if (!author || !author.avatar) return null
    
    // If using Supabase Storage: 
    // return supabase.storage.from('avatars').getPublicUrl(author.avatar).data. publicUrl
    
    // If storing full URLs in the database:
    return author.avatar
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white text-lg">Loading thread...</div>
      </div>
    )
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <div className="bg-[#1a1a1a] border-b border-gray-800 py-4">
          <div className="max-w-4xl mx-auto px-4">
            <Link href="/forum" className="text-[#5865f2] hover: underline">← Back to Forum</Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-[#1a1a1a] border border-gray-800 rounded p-8 text-center">
            <h2 className="text-white text-xl font-bold mb-2">Thread Not Found</h2>
            <p className="text-gray-400 mb-4">{error || 'The thread you are looking for does not exist.'}</p>
            <p className="text-gray-500 text-sm mb-4">Thread ID: {params.id}</p>
            <Link href="/forum" className="text-[#5865f2] hover:underline">
              Return to Forum
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <Link href={`/forum/${encodeURIComponent(thread.category)}`} className="text-[#5865f2] hover: underline text-sm">
            ← Back to {thread.category}
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {/* Original Post */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
          <div className="bg-[#5865f2] px-4 py-2">
            <span className="text-white font-semibold text-sm">{thread.category}</span>
          </div>
          
          <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-4">{thread.title}</h1>
            
            <div className="flex items-start gap-4 pb-4 border-b border-gray-800">
              <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {getAvatarUrl(thread. author) ? (
                  <img 
                    src={getAvatarUrl(thread.author)!} 
                    alt={thread.author?.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xl font-semibold">
                    {thread.author?.username?.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <Link 
                    href={`/profile/${thread.author?. username}`}
                    className={`font-semibold hover:underline ${getUsernameColor(thread.author?.level || 1)}`}
                  >
                    {thread.author?.username || 'Unknown'}
                  </Link>
                  <span className="text-[#5865f2] text-xs font-semibold">
                    LVL {thread.author?.level || 1}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(thread.created_at).toLocaleString()}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {thread.views || 0} views · {replies.length} replies
                </p>
              </div>
            </div>

            <div className="mt-4 text-white whitespace-pre-wrap">
              {thread.content}
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="text-white font-semibold text-lg px-2">
          {replies. length} {replies.length === 1 ?  'Reply' : 'Replies'}
        </div>

        {replies.map((reply) => (
          <div key={reply.id} className="bg-[#1a1a1a] border border-gray-800 rounded p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {getAvatarUrl(reply.author) ? (
                  <img 
                    src={getAvatarUrl(reply.author)!} 
                    alt={reply.author?.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-lg font-semibold">
                    {reply.author?.username?. charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <Link 
                    href={`/profile/${reply.author?.username}`}
                    className={`font-semibold hover:underline ${getUsernameColor(reply.author?.level || 1)}`}
                  >
                    {reply.author?.username || 'Unknown'}
                  </Link>
                  <span className="text-[#5865f2] text-xs font-semibold">
                    LVL {reply.author?.level || 1}
                  </span>
                  <span className="text-gray-500 text-sm">
                    · {new Date(reply.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-white mt-2 whitespace-pre-wrap">{reply.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Reply Form */}
        {user ?  (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded p-6">
            <h3 className="text-white font-semibold mb-4">Post Reply (+5 XP)</h3>
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target. value)}
                placeholder="Write your reply..."
                className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2] min-h-[120px]"
                required
              />
              <button 
                type="submit" 
                className="bg-[#5865f2] hover: bg-[#4752c4] text-white px-6 py-2 rounded font-semibold transition"
              >
                POST REPLY
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded p-6 text-center">
            <p className="text-gray-400">
              <Link href="/login" className="text-[#5865f2] hover:underline">Login</Link> to reply
            </p>
          </div>
        )}
      </div>
    </div>
  )
}