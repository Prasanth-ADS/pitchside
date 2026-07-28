export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `£${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `£${(amount / 1_000).toFixed(0)}K`
  }
  return `£${amount.toLocaleString()}`
}

export function formatCurrencyFull(amount: number): string {
  return `£${amount.toLocaleString('en-GB')}`
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function generateParticipantId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

export const AVATAR_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#06b6d4', '#a855f7', '#f43f5e', '#10b981',
]

export function pickAvatarColor(index: number): string {
  return AVATAR_COLORS[index % AVATAR_COLORS.length]
}

export const POSITION_ORDER = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'CF', 'ST']
export const POSITION_GROUP: Record<string, string> = {
  GK: 'GK',
  CB: 'DEF', LB: 'DEF', RB: 'DEF',
  CDM: 'MID', CM: 'MID', CAM: 'MID',
  LW: 'ATT', RW: 'ATT', CF: 'ATT', ST: 'ATT',
}

export const POSITION_COLORS: Record<string, string> = {
  GK: '#f59e0b',
  CB: '#3b82f6', LB: '#60a5fa', RB: '#60a5fa',
  CDM: '#22c55e', CM: '#4ade80', CAM: '#86efac',
  LW: '#ef4444', RW: '#ef4444', CF: '#f87171', ST: '#dc2626',
}

export function getRatingColor(rating: number): string {
  if (rating >= 88) return '#fbbf24'
  if (rating >= 84) return '#a3e635'
  if (rating >= 80) return '#34d399'
  if (rating >= 75) return '#60a5fa'
  return '#94a3b8'
}

export function getRatingLabel(rating: number): string {
  if (rating >= 90) return 'World Class'
  if (rating >= 85) return 'Elite'
  if (rating >= 80) return 'Excellent'
  if (rating >= 75) return 'Good'
  return 'Decent'
}
