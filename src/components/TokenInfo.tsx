'use client'

import { useState } from 'react'

const CA = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'EMSSFjpBn9L5qeFPGYA1hb3t74koasqYpSbs5Gdvpump'
const DEXSCREENER_PAIR = process.env.NEXT_PUBLIC_DEXSCREENER_PAIR || 'solana/EMSSFjpBn9L5qeFPGYA1hb3t74koasqYpSbs5Gdvpump'
const DEXSCREENER_URL = `https://dexscreener.com/${DEXSCREENER_PAIR}`
const TWITTER_URL = 'https://x.com/fadedentry'

export default function TokenInfo() {
  const [copied, setCopied] = useState(false)

  const copyCA = async () => {
    await navigator.clipboard.writeText(CA)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
      {/* Contract Address */}
      <button
        onClick={copyCA}
        className="flex items-center gap-2 bg-[#2a2a2a] border border-gray-700 hover:border-[#5865f2] text-white px-4 py-2 rounded font-mono text-sm transition"
      >
        <span className="text-gray-400 text-xs font-sans">CA:</span>
        <span className="truncate max-w-[180px] sm:max-w-[240px]">{CA}</span>
        <span className="text-[#5865f2] text-xs font-sans flex-shrink-0">
          {copied ? '✓ Copied!' : '📋 Copy'}
        </span>
      </button>

      {/* Dexscreener */}
      <a
        href={DEXSCREENER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#2a2a2a] border border-gray-700 hover:border-green-500 text-white px-4 py-2 rounded text-sm transition"
      >
        <span>📊</span>
        <span>Dexscreener</span>
      </a>

      {/* Twitter / X */}
      <a
        href={TWITTER_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#2a2a2a] border border-gray-700 hover:border-sky-400 text-white px-4 py-2 rounded text-sm transition"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span>@fadedentry</span>
      </a>
    </div>
  )
}
