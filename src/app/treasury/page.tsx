// src/app/treasury/page.tsx
'use client'

import { useEffect, useState } from 'react'

interface Transaction {
  id: string
  amount: number
  type: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  signature?:  string
  user?: {
    username: string
    level: number
  }
}

export default function TreasuryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [balance, setBalance] = useState<number>(0)
  const [totalDistributed, setTotalDistributed] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [timeUntilNext, setTimeUntilNext] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, balanceRes] = await Promise.all([
          fetch('/api/treasury/transactions'),
          fetch('/api/treasury/balance'),
        ])

        const txData = await txRes.json()
        const balanceData = await balanceRes.json()

        setTransactions(txData. transactions || [])
        setTotalDistributed(txData.totalDistributed || 0)
        setBalance(balanceData. balance || 0)
      } catch (error) {
        console.error('Error fetching treasury data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const minutes = now.getMinutes()
      const seconds = now.getSeconds()
      
      const minutesUntilNext = 4 - (minutes % 5)
      const secondsUntilNext = 59 - seconds
      
      setTimeUntilNext(`${minutesUntilNext}:${secondsUntilNext.toString().padStart(2, '0')}`)
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = Date.now()
    const diff = Math.floor((now - date. getTime()) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">Treasury Dashboard</h1>
          <p className="text-gray-400 mt-1">Track $FORUMS token distributions and treasury balance</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Treasury Balance */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
            <div className="bg-[#5865f2] px-4 py-2">
              <h3 className="text-white font-semibold text-sm">TREASURY BALANCE</h3>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-white mb-1">
                {loading ? '.. .' : balance.toLocaleString()}
              </div>
              <div className="text-gray-500 text-sm">$FORUMS</div>
            </div>
          </div>

          {/* Total Distributed */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
            <div className="bg-[#5865f2] px-4 py-2">
              <h3 className="text-white font-semibold text-sm">TOTAL DISTRIBUTED</h3>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-white mb-1">
                {loading ? '...' : totalDistributed.toLocaleString()}
              </div>
              <div className="text-gray-500 text-sm">$FORUMS</div>
            </div>
          </div>

          {/* Next Distribution */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
            <div className="bg-[#5865f2] px-4 py-2">
              <h3 className="text-white font-semibold text-sm">NEXT DISTRIBUTION</h3>
            </div>
            <div className="p-6">
              <div className="text-4xl font-bold text-[#5865f2] mb-1 font-mono">
                {timeUntilNext}
              </div>
              <div className="text-gray-500 text-sm">Every 5 minutes</div>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden mb-8">
          <div className="bg-[#5865f2] px-4 py-3 flex items-center justify-between">
            <h2 className="text-white font-semibold">PRICE CHART</h2>
            <a
              href={`https://dexscreener.com/solana/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-200 text-sm"
            >
              Open in Dexscreener →
            </a>
          </div>
          <div className="bg-black">
            <iframe
              id="dexscreener-embed"
              title="Dexscreener Chart"
              src={`https://dexscreener.com/solana/${process. env.NEXT_PUBLIC_CONTRACT_ADDRESS}?embed=1&theme=dark&trades=0&info=0`}
              className="w-full h-[500px] border-0"
            />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded overflow-hidden">
          <div className="bg-[#5865f2] px-4 py-3">
            <h2 className="text-white font-semibold">RECENT TRANSACTIONS</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No transactions yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#252525] border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">USER</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">AMOUNT</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">LEVEL</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">STATUS</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">TIME</th>
                    <th className="text-left py-3 px-4 text-gray-400 text-sm font-semibold">TX HASH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#252525] transition">
                      <td className="py-3 px-4 text-white font-medium">
                        {tx.user?.username || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">
                        {tx.amount. toLocaleString()} $FORUMS
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-[#5865f2] text-white px-2 py-1 rounded text-xs font-semibold">
                          LVL {tx.user?.level || 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            tx.status === 'completed'
                              ?  'bg-green-600 text-white'
                              :  tx.status === 'pending'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {tx. status. toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {formatDate(tx.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        {tx.signature ? (
                          <a
                            href={`https://solscan.io/tx/${tx.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#5865f2] hover:underline font-mono text-xs"
                          >
                            {tx.signature.slice(0, 8)}...
                          </a>
                        ) : (
                          <span className="text-gray-600 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}