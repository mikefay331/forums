// src/components/Advertisement.tsx
'use client'

interface AdSlotProps {
  slot: 'header' | 'sidebar' | 'footer'
}

export default function Advertisement({ slot }: AdSlotProps) {
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