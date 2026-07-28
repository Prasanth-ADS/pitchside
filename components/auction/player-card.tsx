'use client'

import { useAuctionStore } from '@/lib/auction-store'
import { POSITION_COLORS, getRatingColor, getRatingLabel } from '@/lib/utils/format'

const STAT_KEYS = [
  { key: 'pace', label: 'PAC' },
  { key: 'shooting', label: 'SHO' },
  { key: 'passing', label: 'PAS' },
  { key: 'dribbling', label: 'DRI' },
  { key: 'defending', label: 'DEF' },
  { key: 'physical', label: 'PHY' },
] as const

function StatBar({ value, color }: { value: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold w-6 text-right" style={{ color }}>{clamped}</span>
    </div>
  )
}

export function PlayerCard() {
  const { currentPlayer } = useAuctionStore()

  if (!currentPlayer) {
    return (
      <div className="w-72 aspect-[3/4] rounded-2xl border border-border bg-card flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2L14.5 7.5L20 8L16 12L17 18L12 15L7 18L8 12L4 8L9.5 7.5L12 2Z" />
        </svg>
        <p className="text-sm">Waiting for next player...</p>
      </div>
    )
  }

  const p = currentPlayer
  const pos = p.primaryPosition
  const posColor = POSITION_COLORS[pos] ?? '#94a3b8'
  const ratingColor = getRatingColor(p.overallRating)
  const attrs = p.attributes

  return (
    <div
      className="player-card-shine w-72 rounded-2xl overflow-hidden border flex flex-col select-none"
      style={{
        borderColor: `${ratingColor}30`,
        background: `linear-gradient(160deg, oklch(0.16 0.02 255) 0%, oklch(0.11 0.015 255) 100%)`,
        boxShadow: `0 0 40px ${ratingColor}20`,
      }}
    >
      {/* Top band: rating + position + meta */}
      <div
        className="px-5 pt-5 pb-3 flex items-start justify-between"
        style={{ background: `linear-gradient(135deg, ${ratingColor}18, transparent 70%)` }}
      >
        <div>
          <div className="text-5xl font-black leading-none" style={{ color: ratingColor }}>
            {p.overallRating}
          </div>
          <div
            className="text-[11px] font-bold tracking-widest uppercase mt-1 px-2 py-0.5 rounded-md inline-block"
            style={{ backgroundColor: `${posColor}20`, color: posColor }}
          >
            {pos}
          </div>
        </div>
        <div className="text-right space-y-0.5">
          <div className="text-xs text-muted-foreground">{p.country?.flagEmoji} {p.country?.name ?? 'Unknown'}</div>
          <div className="text-xs text-muted-foreground">{p.club?.name ?? 'Free Agent'}</div>
          <div className="text-[10px] font-semibold mt-1 px-2 py-0.5 rounded-full border inline-block"
            style={{ borderColor: `${ratingColor}40`, color: ratingColor }}>
            {getRatingLabel(p.overallRating)}
          </div>
        </div>
      </div>

      {/* Player silhouette */}
      <div
        className="flex items-center justify-center py-4"
        style={{ background: `radial-gradient(ellipse at center, ${ratingColor}0a, transparent 70%)` }}
      >
        <svg width="88" height="108" viewBox="0 0 88 108" fill="none">
          <ellipse cx="44" cy="24" rx="14" ry="14" fill={`${ratingColor}25`} />
          <path d="M22 108 Q26 68 44 58 Q62 68 66 108" fill={`${ratingColor}18`} />
          <path d="M30 58 Q20 82 17 108" stroke={`${ratingColor}30`} strokeWidth="3" strokeLinecap="round" />
          <path d="M58 58 Q68 82 71 108" stroke={`${ratingColor}30`} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="44" cy="24" rx="14" ry="14" stroke={`${ratingColor}50`} strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* Name + club */}
      <div className="px-5 pb-1">
        <div className="text-base font-black text-foreground truncate">{p.name}</div>
        <div className="text-xs text-muted-foreground">{p.club?.name ?? 'Free Agent'} · Age {p.age}</div>
      </div>

      {/* Stat bars */}
      {attrs && (
        <div className="px-5 pb-5 mt-3 space-y-1.5">
          {STAT_KEYS.map(({ key, label }) => {
            const val = attrs[key] ?? 50
            const statColor = getRatingColor(val)
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground w-7 uppercase">{label}</span>
                <StatBar value={val} color={statColor} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
