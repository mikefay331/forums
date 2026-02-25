// src/app/profile/[username]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser, setUser } = useAuthStore()
  const [profile, setProfile] = useState<any>(null)
  const [threads, setThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    bio: '',
    wallet_address: ''
  })
  const [saving, setSaving] = useState(false)

  const isOwnProfile = currentUser?.username === params.username

  useEffect(() => {
    loadProfile()
  }, [params.username])

  const loadProfile = async () => {
    try {
      // Fetch user by username
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', params.username)
        .limit(1)

      if (userError) throw userError

      if (!users || users.length === 0) {
        setLoading(false)
        return
      }

      const userData = users[0]
      setProfile(userData)
      setEditData({
        bio: userData.bio || '',
        wallet_address: userData.wallet_address || ''
      })

      // Fetch user's threads
      const { data: userThreads, error: threadsError } = await supabase
        .from('threads')
        .select('*')
        .eq('author_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (threadsError) throw threadsError

      setThreads(userThreads || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading profile:', error)
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!currentUser || !isOwnProfile) return

    setSaving(true)
    try {
      const { data: updated, error } = await supabase
        .from('users')
        .update({
          bio: editData.bio,
          wallet_address: editData.wallet_address
        })
        .eq('id', currentUser.id)
        .select()
        .single()

      if (error) throw error

      // Re-fetch fresh profile and sync both local state and store
      const { data: fresh } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      setProfile(fresh || updated)
      setUser((fresh || updated) as any)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const getUsernameColor = (level: number) => {
    if (level >= 50) return 'text-purple-400'
    if (level >= 25) return 'text-red-400'
    if (level >= 10) return 'text-yellow-400'
    if (level >= 5) return 'text-cyan-400'
    return 'text-white'
  }

  const getAvatarUrl = (user: any) => {
    if (!user || !user.avatar) return null
    // If it's already a full URL, use it directly
    if (user.avatar.startsWith('http')) return user.avatar
    // Otherwise construct from Supabase Storage
    return supabase.storage.from('avatars').getPublicUrl(user.avatar).data.publicUrl
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-white">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
          <Link href="/" className="text-[#5865f2] hover:underline">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-4">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/forum" className="text-[#5865f2] hover:underline text-sm">
            ← Back to Forum
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Card */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
          <div className="bg-[#5865f2] h-24"></div>
          
          <div className="px-6 pb-6">
            <div className="flex items-start gap-6 -mt-12">
              {/* Avatar */}
              <div className="w-24 h-24 bg-[#2a2a2a] rounded-full flex items-center justify-center border-4 border-[#1a1a1a] overflow-hidden flex-shrink-0">
                {getAvatarUrl(profile) ? (
                  <img
                    src={getAvatarUrl(profile)!}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {profile.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className={`text-3xl font-bold ${getUsernameColor(profile.level || 1)}`}>
                      {profile.username}
                    </h1>
                    <p className="text-[#5865f2] font-semibold">Level {profile.level || 1}</p>
                  </div>
                  {isOwnProfile && !isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2 rounded font-semibold transition"
                    >
                      Edit Profile
                    </button>
                  )}
                  {!isOwnProfile && currentUser && (
                    <Link
                      href={`/messages?user=${profile.username}`}
                      className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2 rounded font-semibold transition inline-block"
                    >
                      Send Message
                    </Link>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-[#2a2a2a] rounded p-3 text-center">
                    <p className="text-white text-2xl font-bold">{profile.posts || 0}</p>
                    <p className="text-gray-500 text-xs">Posts</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded p-3 text-center">
                    <p className="text-white text-2xl font-bold">{profile.experience || 0}</p>
                    <p className="text-gray-500 text-xs">XP</p>
                  </div>
                  <div className="bg-[#2a2a2a] rounded p-3 text-center">
                    <p className="text-white text-2xl font-bold">{threads.length}</p>
                    <p className="text-gray-500 text-xs">Threads</p>
                  </div>
                </div>

                {/* Bio & Wallet */}
                {isEditing ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-white font-semibold mb-2 text-sm">Bio</label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                        className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2]"
                        rows={3}
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                      />
                    </div>

                    <div>
                      <label className="block text-white font-semibold mb-2 text-sm">
                        Wallet Address
                      </label>
                      <input
                        type="text"
                        value={editData.wallet_address}
                        onChange={(e) => setEditData({ ...editData, wallet_address: e.target.value })}
                        className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2] font-mono text-sm"
                        placeholder="Enter your wallet address..."
                        maxLength={44}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="bg-[#5865f2] hover:bg-[#4752c4] disabled:bg-gray-600 text-white px-6 py-2 rounded font-semibold transition"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditData({
                            bio: profile.bio || '',
                            wallet_address: profile.wallet_address || ''
                          })
                        }}
                        disabled={saving}
                        className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white px-6 py-2 rounded font-semibold transition border border-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {profile.bio && (
                      <div>
                        <p className="text-gray-400 text-sm">{profile.bio}</p>
                      </div>
                    )}
                    
                    {profile.wallet_address && (
                      <div className="bg-[#2a2a2a] rounded p-3">
                        <p className="text-gray-500 text-xs mb-1">💰 Wallet Address</p>
                        <p className="text-white font-mono text-xs break-all">
                          {profile.wallet_address}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-gray-500 text-sm mt-4">
                  Joined {formatDate(profile.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Threads */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
          <div className="bg-[#5865f2] px-4 py-3">
            <h2 className="text-white font-semibold">Recent Threads</h2>
          </div>

          {threads.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No threads yet
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/forum/thread/${thread.id}`}
                  className="block px-4 py-4 hover:bg-[#252525] transition"
                >
                  <h3 className="text-white font-semibold mb-1">{thread.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{thread.category}</span>
                    <span>👁️ {thread.views || 0}</span>
                    <span>{formatDate(thread.created_at)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}