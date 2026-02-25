// src/app/page.tsx
import LatestActivities from '@/components/LatestActivities'
import Shoutbox from '@/components/Shoutbox'
import Advertisement from '@/components/Advertisement'
import ForumStats from '@/components/ForumStats'
import CategoryList from '@/components/CategoryList'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">$FORUMS</h1>
          <p className="text-gray-400">The community for crypto discussion. Level up by posting.</p>
        </div>
      </div>

      {/* Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <Advertisement slot="header" />
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <ForumStats />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 mt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Forum List */}
          <div className="lg:col-span-9">
            <CategoryList />

            {/* Info Box */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded mt-4 p-6">
              <h2 className="text-white font-semibold mb-4">How It Works</h2>
              <ol className="space-y-2 text-gray-400 text-sm">
                <li>1. Register an account (no email required)</li>
                <li>2. Post threads (+10 XP) and replies (+5 XP)</li>
                <li>3. Level up every 100 XP</li>
              </ol>
            </div>
          </div>

          {/* Sidebar Right - Latest Activity */}
          <div className="lg:col-span-3 space-y-4">
            <LatestActivities />
            <Advertisement slot="sidebar" />
          </div>
        </div>

        {/* Shoutbox - Full Width Below */}
        <div className="mt-4">
          <Shoutbox />
        </div>
      </div>
    </div>
  )
}