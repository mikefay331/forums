// src/components/Shoutbox.tsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'
import Link from 'next/link'

interface ShoutMessage {
  id: string
  message: string
  created_at: string
  user_id: string
  user?: {
    id: string
    username: string
    level: number
    avatar?: string
  }
}

export default function Shoutbox() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<ShoutMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const shoutboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:shoutbox')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'shoutbox' 
      }, async (payload) => {
        // Fetch user data for the new message
        const { data: userData } = await supabase
          .from('users')
          .select('id, username, level, avatar')
          .eq('id', payload.new.user_id)
          .single()
        
        const fullMessage = { ...payload.new, user: userData } as ShoutMessage
        setMessages(prev => [...prev, fullMessage].slice(-20))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting)
        })
      },
      { threshold: 0.1 }
    )

    if (shoutboxRef.current) {
      observer.observe(shoutboxRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isInView && !isUserScrolling) {
      scrollToBottom()
    }
  }, [messages, isInView, isUserScrolling])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('shoutbox')
        .select(`
          *,
          user:users!user_id(id, username, level, avatar)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setMessages((data || []).reverse() as any)
    } catch (error) {
      console.error('Error loading shoutbox:', error)
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      
      if (isNearBottom) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }
  }

  const handleScroll = () => {
    if (!messagesContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
    setIsUserScrolling(!isAtBottom)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim()) return

    try {
      const { error } = await supabase.from('shoutbox').insert({
        user_id: user.id,
        message: newMessage.trim()
      })
      
      if (error) throw error
      
      setNewMessage('')
      setIsUserScrolling(false)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const getUsernameColor = (level: number) => {
    if (level >= 50) return 'text-purple-400'
    if (level >= 25) return 'text-red-400'
    if (level >= 10) return 'text-yellow-400'
    if (level >= 5) return 'text-cyan-400'
    return 'text-gray-300'
  }

  const getLevelBadgeColor = (level: number) => {
    if (level >= 50) return 'bg-gradient-to-r from-purple-600 to-pink-600'
    if (level >= 25) return 'bg-gradient-to-r from-red-600 to-orange-600'
    if (level >= 10) return 'bg-gradient-to-r from-yellow-600 to-amber-600'
    if (level >= 5) return 'bg-gradient-to-r from-cyan-600 to-blue-600'
    return 'bg-gradient-to-r from-gray-600 to-gray-700'
  }

  const getAvatarUrl = (msgUser: any) => {
    if (!msgUser || !msgUser.avatar) return null
    // Assuming Supabase storage bucket named 'avatars'
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${msgUser.avatar}`
  }

  const getAvatarBorderColor = (level: number) => {
    if (level >= 50) return 'border-purple-500'
    if (level >= 25) return 'border-red-500'
    if (level >= 10) return 'border-yellow-500'
    if (level >= 5) return 'border-cyan-500'
    return 'border-gray-600'
  }

  return (
    <div ref={shoutboxRef} className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden shadow-xl w-full max-w-sm">
      <div className="bg-gradient-to-r from-[#5865f2] to-[#4752c4] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-white font-bold text-xs tracking-wide">LIVE SHOUTBOX</h3>
        </div>
      </div>

      <div ref={messagesContainerRef} onScroll={handleScroll} className="bg-[#0f0f0f] h-[340px] overflow-y-auto custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-xs font-medium">No messages yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {messages.map((msg) => {
              const msgUser = msg.user
              const userLevel = msgUser?.level || 1
              const avatarUrl = getAvatarUrl(msgUser)
              
              return (
                <div key={msg.id} className="p-3 flex items-start gap-3 hover:bg-white/5 transition-colors">
                  <Link href={`/profile/${msgUser?.username || 'unknown'}`} className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full border-2 ${getAvatarBorderColor(userLevel)} overflow-hidden bg-gray-800 flex items-center justify-center`}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-bold">{msgUser?.username?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex flex-col">
                        <Link href={`/profile/${msgUser?.username || 'unknown'}`} className={`font-black text-sm ${getUsernameColor(userLevel)} truncate hover:underline`}>
                          {msgUser?.username || 'Anonymous'}
                        </Link>
                        <span className={`${getLevelBadgeColor(userLevel)} text-white text-[8px] font-black px-1 rounded w-fit mt-0.5`}>
                          LVL {userLevel}
                        </span>
                      </div>
                      <span className="text-gray-600 text-[9px]">{formatTime(msg.created_at)}</span>
                    </div>
                    <p className="text-white text-sm break-words leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {user ? (
        <form onSubmit={handleSend} className="p-3 bg-[#1a1a1a] border-t border-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write a message..."
              maxLength={200}
              className="flex-1 bg-[#0f0f0f] border border-gray-700 text-white px-3 py-2 text-sm rounded focus:outline-none focus:border-[#5865f2]"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-gray-700 text-white px-4 py-2 font-bold rounded text-xs transition-colors"
            >
              SEND
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-[#1a1a1a] border-t border-gray-800 text-center">
          <Link href="/login" className="text-[#5865f2] text-xs font-bold hover:underline">Login to chat</Link>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f0f0f; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #5865f2; }
      `}</style>
    </div>
  )
}