// src/components/Advertisement.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AdSlotProps {
  slot: 'header' | 'sidebar' | 'footer'
}

export default function Advertisement({ slot }: AdSlotProps) {
  const [ad, setAd] = useState<any>(null)

  useEffect(() => {
    loadAd()
  }, [slot])

  const loadAd = async () => {
    try {
      const now = new Date().toISOString()
      const result = await pb.collection('advertisements').getList(1, 1, {
        filter: `slot = "${slot}" && active = true && start_date <= "${now}" && end_date >= "${now}"`
      })
      if (result.items.length > 0) setAd(result.items[0])
    } catch (error) {
      // Silent fail
    }
  }

  if (!ad) {
    return (
      <div className="bg-[#1a1a1a] border border-[#5865f2] rounded p-6 text-center">
        <p className="text-gray-400 text-sm mb-1">📢 Advertise Here</p>
        <p className="text-white font-semibold">1 SOL / 24 Hours</p>
        <p className="text-gray-500 text-xs mt-2">
          DM <a href="https://x.com/fadedentry" target="_blank" className="text-[#5865f2] hover:underline">@fadedentry</a> on X
        </p>
      </div>
    )
  }

  return (
    <a href={ad.link} target="_blank" className="block bg-[#1a1a1a] border border-[#5865f2] rounded overflow-hidden hover:border-white transition">
      {ad.image_url ?  (
        <img src={ad.image_url} alt={ad.title} className="w-full" />
      ) : (
        <div className="p-6 text-center">
          <p className="text-white font-semibold">{ad.title}</p>
        </div>
      )}
    </a>
  )
}