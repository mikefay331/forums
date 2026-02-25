// src/app/forum/page.tsx
import CategoryList from '@/components/CategoryList'
import ForumStats from '@/components/ForumStats'
import Link from 'next/link'

export default function ForumPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-[#5865f2] hover:underline text-sm mb-2 block">
              ← Home
            </Link>
            <h1 className="text-2xl font-bold text-white">Forum</h1>
          </div>
          <Link
            href="/forum/new"
            className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-2 rounded font-semibold transition text-sm"
          >
            + New Thread
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4">
          <ForumStats />
        </div>
        <CategoryList />
      </div>
    </div>
  )
}