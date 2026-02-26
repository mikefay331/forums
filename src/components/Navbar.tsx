// src/components/Navbar.tsx
'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const { user, setUser } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-[#1a1a1a] border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Left - Logo & Main Nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-gray-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="font-semibold">Home</span>
            </Link>

            <Link href="/forum" className="text-gray-400 hover:text-white transition">
              Forum
            </Link>

            {user && (
              <Link href="/messages" className="text-gray-400 hover:text-white transition">
                Messages
              </Link>
            )}
          </div>

          {/* Right - User Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 text-gray-300 hover:text-white">
                  <div className="w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar.startsWith('http') ? user.avatar : supabase.storage.from('avatars').getPublicUrl(user.avatar).data.publicUrl}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{user.username}</span>
                  <span className="text-xs bg-[#5865f2] px-2 py-0.5 rounded">LVL {user.level || 1}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-400 hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-1.5 rounded text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}