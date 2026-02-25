// src/app/messages/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'

// 1. Move the logic into a separate inner component
function MessagesContent() {
  const { user } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadConversations()

    // Check if opening DM from profile
    const username = searchParams.get('user')
    if (username) {
      openConversationByUsername(username)
    }

    // Refresh messages every 5 seconds
    const interval = setInterval(() => {
      if (selectedUser) {
        loadMessages(selectedUser.id)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user, selectedUser])

  const loadConversations = async () => {
    if (!user) return

    try {
      // Get all messages where user is sender or recipient
      const { data: allMessages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(id, username, avatar, level),
          recipient:users!recipient_id(id, username, avatar, level)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get unique users and their last message
      const userMap = new Map()
      
      allMessages?.forEach((msg: any) => {
        const otherUser = msg.sender_id === user.id ? msg.recipient : msg.sender
        
        if (otherUser && !userMap.has(otherUser.id)) {
          userMap.set(otherUser.id, {
            ...otherUser,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            unread: msg.recipient_id === user.id && !msg.is_read
          })
        }
      })

      setConversations(Array.from(userMap.values()).sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      ))
      setLoading(false)
    } catch (error) {
      console.error('Error loading conversations:', error)
      setLoading(false)
    }
  }

  const openConversationByUsername = async (username: string) => {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .limit(1)

      if (error) throw error

      if (users && users.length > 0) {
        openConversation(users[0])
      }
    } catch (error) {
      console.error('Error finding user:', error)
    }
  }

  const openConversation = async (otherUser: any) => {
    setSelectedUser(otherUser)
    await loadMessages(otherUser.id)
  }

  const loadMessages = async (otherUserId: string) => {
    if (!user) return

    try {
      // Get messages between current user and selected user
      const { data: messageData, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!sender_id(id, username, avatar),
          recipient:users!recipient_id(id, username, avatar)
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(messageData || [])

      // Mark unread messages as read
      const unreadMessages = messageData?.filter((msg: any) => 
        msg.recipient_id === user.id && !msg.is_read
      ) || []

      if (unreadMessages.length > 0) {
        const unreadIds = unreadMessages.map(msg => msg.id)
        
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadIds)

        // Reload conversations to update unread status
        loadConversations()
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedUser || !newMessage.trim()) return

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedUser.id,
          content: newMessage.trim(),
          is_read: false
        })

      if (error) throw error

      setNewMessage('')
      await loadMessages(selectedUser.id)
      await loadConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    }
  }

  const getAvatarUrl = (userObj: any) => {
    if (!userObj?.avatar) return null
    if (userObj.avatar.startsWith('http')) return userObj.avatar
    return supabase.storage.from('avatars').getPublicUrl(userObj.avatar).data.publicUrl
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    const now = Date.now()
    const then = new Date(dateString).getTime()
    const diff = Math.floor((now - then) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-4 h-[600px]">
          {/* Conversations List */}
          <div className="col-span-4 bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
            <div className="bg-[#5865f2] px-4 py-2">
              <h3 className="text-white font-semibold text-sm">CONVERSATIONS</h3>
            </div>
            <div className="overflow-y-auto h-[calc(600px-40px)]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-[#252525] transition border-b border-gray-800 ${
                      selectedUser?.id === conv.id ? 'bg-[#252525]' : ''
                    }`}
                  >
                    <div className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {getAvatarUrl(conv) ? (
                        <img src={getAvatarUrl(conv)!} alt={conv.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold">{conv.username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-semibold truncate">{conv.username}</p>
                        {conv.unread && (
                          <span className="w-2 h-2 bg-[#5865f2] rounded-full flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm truncate">{conv.lastMessage}</p>
                      <p className="text-gray-600 text-xs">{formatDate(conv.lastMessageTime)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="col-span-8 bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden flex flex-col">
            {selectedUser ? (
              <>
                <div className="bg-[#5865f2] px-4 py-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center overflow-hidden">
                    {getAvatarUrl(selectedUser) ? (
                      <img src={getAvatarUrl(selectedUser)!} alt={selectedUser.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold">{selectedUser.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold">{selectedUser.username}</h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-[#0f0f0f] space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      No messages yet.  Start the conversation! 
                    </div>
                  ) : (
                    messages.map((msg: any) => {
                      const isMine = msg.sender_id === user.id
                      return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isMine ? 'bg-[#5865f2]' :  'bg-[#2a2a2a]'} px-4 py-2 rounded-lg`}>
                            <p className="text-white text-sm break-words">{msg.content}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-gray-300">{formatTime(msg.created_at)}</p>
                              {isMine && (
                                <span className="text-xs text-gray-300">
                                  {msg.is_read ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <form onSubmit={sendMessage} className="p-4 bg-[#1a1a1a] border-t border-gray-800">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      maxLength={500}
                      className="flex-1 bg-[#2a2a2a] border-0 text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#5865f2]"
                    />
                    <button
                      type="submit"
                      className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2 rounded font-semibold transition"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 2. Wrap the component in Suspense in the default export
export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f] text-white p-8">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  )
}