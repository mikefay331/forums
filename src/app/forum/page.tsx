// src/app/forum/page. tsx
'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ForumRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const category = searchParams.get('category')
    
    if (category) {
      // Redirect to category page
      router.replace(`/forum/${encodeURIComponent(category)}`)
    } else {
      // No category specified, redirect to homepage
      router.replace('/')
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <p className="text-gray-400">Redirecting... </p>
    </div>
  )
}

export default function ForumPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <ForumRedirect />
    </Suspense>
  )
}