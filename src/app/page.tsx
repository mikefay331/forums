import LatestActivities from '@/components/LatestActivities'
import Shoutbox from '@/components/Shoutbox'
import Advertisement from '@/components/Advertisement'
import ForumStats from '@/components/ForumStats'
import CategoryList from '@/components/CategoryList'
import TokenInfo from '@/components/TokenInfo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* Hero */}
      <div className="bg-[#1a1a1a] border-b border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-3">$FORUMS</h1>
          <p className="text-gray-300 text-lg mb-2">The crypto community forum where posting earns rewards.</p>
          <p className="text-gray-500 text-sm mb-8 max-w-2xl mx-auto">
            Back to the basics — no algorithms, no noise. Join the discussion on Bitcoin, altcoins, trading, and more.
            Post threads and replies to earn XP, level up your account, and earn $FORUMS token rewards.
          </p>
          <TokenInfo />
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

            {/* How It Works */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded mt-4 p-6">
              <h2 className="text-white font-semibold mb-4">How It Works</h2>
              <ol className="space-y-2 text-gray-400 text-sm list-none">
                <li className="flex gap-3"><span className="text-[#5865f2] font-bold">1.</span>Register an account and join the community</li>
                <li className="flex gap-3"><span className="text-[#5865f2] font-bold">2.</span>Post threads (+10 XP) and replies (+5 XP) to earn experience</li>
                <li className="flex gap-3"><span className="text-[#5865f2] font-bold">3.</span>Level up every 100 XP and climb the leaderboard</li>
                <li className="flex gap-3"><span className="text-[#5865f2] font-bold">4.</span>Active members earn $FORUMS token rewards</li>
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