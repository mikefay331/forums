// src/lib/constants.ts (formerly pocketbase.ts)
// Shared constants and utility functions

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
  return Math.floor(xp / XP_REWARDS.XP_PER_LEVEL) + 1
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