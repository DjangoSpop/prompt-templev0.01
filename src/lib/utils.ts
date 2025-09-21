import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K'
  return (num / 1000000).toFixed(1) + 'M'
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Safely converts a date value to a Date object
 */
export function toDate(value: Date | string | number): Date {
  if (value instanceof Date) {
    return value;
  }
  
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    console.warn('Invalid date value:', value);
    return new Date(); // Return current date as fallback
  }
  
  return date;
}

export function formatRelativeTime(date: Date | string): string {
  // Convert to Date object safely
  const dateObj = toDate(date);
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(dateObj);
}

export function calculateLevel(experience: number): { level: number; progress: number } {
  const levels = [0, 500, 1200, 2500, 5000, 10000, 20000, 35000, 60000, 100000]
  
  let level = 1
  for (let i = levels.length - 1; i >= 0; i--) {
    if (experience >= levels[i]) {
      level = i + 1
      break
    }
  }
  
  const currentLevelXP = levels[level - 1] || 0
  const nextLevelXP = levels[level] || levels[levels.length - 1]
  const progress = ((experience - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  
  return { level, progress: Math.min(progress, 100) }
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return 'text-gray-400'
    case 'rare': return 'text-blue-400'
    case 'epic': return 'text-purple-400'
    case 'legendary': return 'text-yellow-400'
    default: return 'text-gray-400'
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}