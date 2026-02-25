// src/lib/pocketbase.ts
import PocketBase from 'pocketbase'

export const pb = new PocketBase(
  process.env. NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090'
)

pb.autoCancellation(false)

export interface User {
  id: string
  username: string
  email:  string
  avatar?: string
  bio?: string
  wallet_address?: string
  level: number
  experience: number
  posts: number
  replies: number
  total_earned?:  number
  collectionId:  string
  collectionName: string
  created: string
  updated: string
}

export interface Thread {
  id: string
  title: string
  content: string
  author:  string
  category: string
  views: number
  replies_count: number
  is_pinned: boolean
  created: string
  updated: string
  expand?:  {
    author: User
  }
}

export interface Reply {
  id: string
  content: string
  author: string
  thread: string
  created:  string
  updated: string
  expand?: {
    author: User
  }
}

export interface Transaction {
  id: string
  user: string
  amount:  number
  tx_hash: string
  status: 'pending' | 'completed' | 'failed'
  level: number
  created: string
  expand?:  {
    user: User
  }
}

export const CATEGORIES = [
  'Announcements',
  'Bitcoin Discussion',
  'Altcoin Discussion',
  'Trading & Speculation',
  'Mining',
  'Technical Support',
  'Development & Technical',
  'Economy',
  'Marketplace',
  'Off-Topic',
  '$FORUMS Community',
]

export const XP_REWARDS = {
  NEW_THREAD: 10,
  NEW_REPLY: 5,
  XP_PER_LEVEL: 100,
}

export function calculateLevel(xp: number): number {
  return Math. floor(xp / XP_REWARDS.XP_PER_LEVEL) + 1
}

export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP)
  return currentLevel * XP_REWARDS.XP_PER_LEVEL
}

export function getXPProgress(currentXP: number): number {
  const currentLevelXP = (calculateLevel(currentXP) - 1) * XP_REWARDS.XP_PER_LEVEL
  const xpInCurrentLevel = currentXP - currentLevelXP
  return (xpInCurrentLevel / XP_REWARDS.XP_PER_LEVEL) * 100
}