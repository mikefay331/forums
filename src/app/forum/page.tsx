'use client'
import CategoryList from '@/components/CategoryList'
import ForumStats from '@/components/ForumStats'

export default function ForumPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">Forum</h1>
          <p className="text-gray-400 mt-1">Browse all categories</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-4"><ForumStats /></div>
      <div className="max-w-7xl mx-auto px-4 mt-6 pb-8"><CategoryList /></div>
    </div>
  )
}