// src/app/api/treasury/next-distribution/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const now = Date.now()
  const FIVE_MINUTES = 5 * 60 * 1000
  
  // Calculate next distribution (every 5 minutes on the clock)
  const nextDistribution = Math.ceil(now / FIVE_MINUTES) * FIVE_MINUTES
  const secondsUntil = Math.floor((nextDistribution - now) / 1000)
  
  return NextResponse.json({
    nextDistribution,
    secondsUntil,
    currentTime: now
  })
}