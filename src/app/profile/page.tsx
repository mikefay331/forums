// src/app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import imageCompression from 'browser-image-compression'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [bio, setBio] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [saving, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    setBio(user.bio || '')
    setWalletAddress(user.wallet_address || '')
    
    // Set avatar preview if exists
    if (user.avatar) {
      setAvatarPreview(user.avatar)
    }
  }, [user, router])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (! file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setCompressing(true)

    try {
      // Compression options
      const options = {
        maxSizeMB: 0.2, // 200KB
        maxWidthOrHeight: 400, // Max dimension 400px
        useWebWorker: true,
        fileType: 'image/jpeg' as const // Convert to JPEG for better compression
      }

      console.log(`Original file size: ${(file. size / 1024).toFixed(2)} KB`)

      // Compress the image
      const compressedFile = await imageCompression(file, options)

      console.log(`Compressed file size: ${(compressedFile.size / 1024).toFixed(2)} KB`)

      // Rename to have . jpg extension
      const finalFile = new File([compressedFile], 'avatar.jpg', { type: 'image/jpeg' })

      setAvatarFile(finalFile)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader. result as string)
      }
      reader.readAsDataURL(finalFile)

    } catch (error) {
      console.error('Error compressing image:', error)
      alert('Failed to compress image')
    } finally {
      setCompressing(false)
    }
  }

  const handleSave = async () => {
    if (!user) return

    // Validate wallet address (basic Solana validation)
    if (walletAddress && (walletAddress.length < 32 || walletAddress.length > 44)) {
      alert('Invalid Solana wallet address.  Must be 32-44 characters.')
      return
    }

    setSaving(true)
    try {
      let avatarUrl = user.avatar

      // Upload avatar to Supabase Storage if changed
      if (avatarFile) {
        const fileExt = 'jpg'
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        // Upload to Supabase Storage
        const { error:  uploadError } = await supabase. storage
          .from('avatars')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        avatarUrl = urlData.publicUrl
      }

      // Update user profile
      const { data: updated, error:  updateError } = await supabase
        .from('users')
        .update({
          bio:  bio. trim(),
          wallet_address:  walletAddress. trim(),
          avatar: avatarUrl
        })
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      console.log('Updated user:', updated)

      setUser(updated as any)
      setEditing(false)
      setAvatarFile(null)
      alert('Profile updated!')
    } catch (error:  any) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile: ' + error.message)
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

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview
    if (user?. avatar) return user.avatar
    return null
  }

  if (! user) return null

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
          {/* Header */}
          <div className="bg-[#5865f2] px-6 py-4 flex items-center justify-between">
            <h2 className="text-white font-semibold">YOUR PROFILE</h2>
            {! editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-white text-[#5865f2] px-4 py-1 rounded text-sm font-semibold hover:bg-gray-200"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="p-6 space-y-6">
            {/* Avatar & Username */}
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-[#2a2a2a] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-gray-700">
                {getAvatarUrl() ? (
                  <img 
                    src={getAvatarUrl()!} 
                    alt={user.username} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {user.username. charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <h2 className={`text-2xl font-bold ${getUsernameColor(user.level || 1)}`}>
                  {user.username}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-[#5865f2] text-white px-3 py-1 rounded text-sm font-semibold">
                    LEVEL {user.level || 1}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {user.experience || 0} XP
                  </span>
                </div>
              </div>
            </div>

            {editing ? (
              <>
                {/* Edit Avatar */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Avatar Image {compressing && <span className="text-yellow-400">(Compressing...)</span>}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={compressing}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#5865f2] file:text-white
                      hover:file:bg-[#4752c4]
                      file:cursor-pointer cursor-pointer
                      disabled:opacity-50"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Images are automatically compressed to ~200KB max.  Recommended:  Square images work best.
                  </p>
                  
                  {/* Preview */}
                  {avatarPreview && (
                    <div className="mt-3">
                      <p className="text-gray-400 text-xs mb-2">Preview: </p>
                      <img 
                        src={avatarPreview} 
                        alt="Preview" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-700"
                      />
                      {avatarFile && (
                        <p className="text-gray-500 text-xs mt-1">
                          Compressed size: {(avatarFile.size / 1024).toFixed(2)} KB
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Edit Bio */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:border-[#5865f2] min-h-[120px]"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    {bio. length}/500 characters
                  </p>
                </div>

                {/* Edit Wallet Address */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    💰 Solana Wallet Address (for $FORUMS payouts)
                  </label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your Solana wallet address..."
                    maxLength={44}
                    className="w-full bg-[#2a2a2a] border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-[#5865f2] font-mono text-sm"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    This wallet will receive $FORUMS token distributions every 5 minutes based on your level.  Must be a valid Solana address (32-44 characters).
                  </p>
                  {! walletAddress && (
                    <p className="text-yellow-400 text-xs mt-2">
                      ⚠️ You won&apos;t receive token payouts without a wallet address! 
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving || compressing}
                    className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-6 py-2 rounded font-semibold disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setAvatarFile(null)
                      setAvatarPreview('')
                      setBio(user.bio || '')
                      setWalletAddress(user. wallet_address || '')
                    }}
                    disabled={saving || compressing}
                    className="bg-gray-700 hover: bg-gray-600 text-white px-6 py-2 rounded disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Display Bio */}
                <div>
                  <h3 className="text-gray-400 text-sm font-semibold mb-2">BIO</h3>
                  <p className="text-white">
                    {user. bio || <span className="text-gray-500 italic">No bio yet</span>}
                  </p>
                </div>

                {/* Wallet Address */}
                <div className="pt-4 border-t border-gray-800">
                  <h3 className="text-gray-400 text-sm font-semibold mb-2">💰 WALLET ADDRESS</h3>
                  {user.wallet_address ? (
                    <div className="bg-[#2a2a2a] rounded p-3">
                      <p className="text-white font-mono text-sm break-all">{user.wallet_address}</p>
                      <a
                        href={`https://solscan.io/account/${user. wallet_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#5865f2] hover: underline text-xs mt-2 inline-block"
                      >
                        View on Solscan →
                      </a>
                    </div>
                  ) : (
                    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded p-4">
                      <p className="text-yellow-400 text-sm">
                        ⚠️ No wallet address set.  Click &quot;Edit Profile&quot; to add your Solana wallet and start receiving $FORUMS token payouts! 
                      </p>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <p className="text-gray-400 text-sm">Posts</p>
                    <p className="text-white text-2xl font-bold">{user. posts || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Experience</p>
                    <p className="text-white text-2xl font-bold">{user. experience || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Rewards</p>
                    <p className="text-white text-2xl font-bold">{user. total_rewards || 0} $FORUMS</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}