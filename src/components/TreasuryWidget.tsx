// src/components/TreasuryWidget.tsx
'use client'

import { useEffect, useState } from 'react'

const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET
const CONTRACT_ADDRESS = process.env. NEXT_PUBLIC_CONTRACT_ADDRESS

export default function TreasuryWidget() {
  const [tokenData, setTokenData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTokenData()
    const interval = setInterval(loadTokenData, 120000) // Every 2 minutes
    return () => clearInterval(interval)
  }, [])

  const loadTokenData = async () => {
    if (!CONTRACT_ADDRESS) {
      setLoading(false)
      return
    }

    try {
      // Try fetching from Dexscreener using token address instead of pair
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONTRACT_ADDRESS}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch')
      }

      const data = await response.json()
      console.log('Dexscreener data:', data)

      if (data.pairs && data.pairs.length > 0) {
        // Get the first pair (usually the main one)
        setTokenData(data.pairs[0])
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error loading token data:', err)
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
      <div className="bg-[#5865f2] px-4 py-2">
        <h3 className="text-white font-semibold text-sm">💰 $FORUMS Token</h3>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : tokenData ? (
          <>
            {/* Price */}
            <div>
              <p className="text-gray-500 text-xs mb-1">Price (USD)</p>
              <p className="text-white text-2xl font-bold">
                ${tokenData?.priceUsd ?  parseFloat(tokenData.priceUsd).toFixed(8) : '0.00000000'}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs mb-1">Market Cap</p>
                <p className="text-white text-sm font-semibold">
                  ${tokenData?.fdv ? (parseFloat(tokenData.fdv) / 1000).toFixed(1) : '0'}K
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">24h Volume</p>
                <p className="text-white text-sm font-semibold">
                  ${tokenData?.volume?.h24 ? (parseFloat(tokenData.volume. h24) / 1000).toFixed(1) : '0'}K
                </p>
              </div>
            </div>

            {/* Price Change */}
            {tokenData?.priceChange?.h24 && (
              <div>
                <p className="text-gray-500 text-xs mb-1">24h Change</p>
                <p className={`text-lg font-bold ${parseFloat(tokenData.priceChange. h24) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(tokenData.priceChange.h24) >= 0 ? '+' : ''}
                  {parseFloat(tokenData. priceChange.h24).toFixed(2)}%
                </p>
              </div>
            )}

            {/* Links */}
            <div className="border-t border-gray-800 pt-3 space-y-2">
              <a
                href={tokenData?.url || `https://dexscreener.com/solana/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[#5865f2] hover:underline text-sm"
              >
                📊 View Chart →
              </a>
              {TREASURY_WALLET && (
                <a
                  href={`https://solscan.io/account/${TREASURY_WALLET}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#5865f2] hover:underline text-sm"
                >
                  🏦 View Treasury →
                </a>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Fallback when no data */}
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-4">Token data unavailable</p>
            </div>

            {/* Show links anyway */}
            <div className="border-t border-gray-800 pt-3 space-y-2">
              {CONTRACT_ADDRESS && (
                <a
                  href={`https://dexscreener.com/solana/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#5865f2] hover:underline text-sm"
                >
                  📊 View on Dexscreener →
                </a>
              )}
              {TREASURY_WALLET && (
                <a
                  href={`https://solscan.io/account/${TREASURY_WALLET}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#5865f2] hover:underline text-sm"
                >
                  🏦 View Treasury on Solscan →
                </a>
              )}
              {CONTRACT_ADDRESS && (
                <a
                  href={`https://solscan.io/token/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#5865f2] hover:underline text-sm"
                >
                  🔍 View Token on Solscan →
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}