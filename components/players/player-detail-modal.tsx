'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getRatingColor, getRatingLabel, POSITION_COLORS } from '@/lib/utils/format'
import type { PlayerWithDetails } from '@/lib/db/schema'

const MAIN_STATS = [
  { key: 'pace', label: 'Pace' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'passing', label: 'Passing' },
  { key: 'dribbling', label: 'Dribbling' },
  { key: 'defending', label: 'Defending' },
  { key: 'physical', label: 'Physical' },
] as const

const DETAIL_STATS = [
  { key: 'vision', label: 'Vision' },
  { key: 'positioning', label: 'Positioning' },
  { key: 'finishing', label: 'Finishing' },
  { key: 'crossing', label: 'Crossing' },
  { key: 'longShots', label: 'Long Shots' },
  { key: 'heading', label: 'Heading' },
  { key: 'standingTackle', label: 'Tackle' },
  { key: 'jumping', label: 'Jumping' },
  { key: 'strength', label: 'Strength' },
  { key: 'stamina', label: 'Stamina' },
  { key: 'acceleration', label: 'Acceleration' },
  { key: 'sprintSpeed', label: 'Sprint Speed' },
  { key: 'agility', label: 'Agility' },
  { key: 'reactions', label: 'Reactions' },
] as const

interface Props {
  player: PlayerWithDetails
  onClose: () => void
}

function StatRow({ label, value }: { label: string; value: number }) {
  const color = getRatingColor(value)
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 text-right flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${clamped}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-7 text-right flex-shrink-0" style={{ color }}>{clamped}</span>
    </div>
  )
}

export function PlayerDetailModal({ player, onClose }: Props) {
  const ratingColor = getRatingColor(player.overallRating)
  const posColor = POSITION_COLORS[player.primaryPosition] ?? '#94a3b8'
  const attrs = player.attributes

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden">
        {/* Header band */}
        <div
          className="relative px-6 pt-6 pb-5 flex items-start gap-6"
          style={{ background: `linear-gradient(135deg, ${ratingColor}12, transparent 70%)` }}
        >
          {/* Rating + silhouette */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="text-6xl font-black leading-none" style={{ color: ratingColor }}>
              {player.overallRating}
            </div>
            <div
              className="text-xs font-bold px-2 py-0.5 rounded-md"
              style={{ backgroundColor: `${posColor}25`, color: posColor }}
            >
              {player.primaryPosition}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-foreground truncate">{player.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {player.country?.flagEmoji} {player.country?.name}
              </Badge>
              <Badge variant="outline" className="text-xs border-border">
                {player.club?.name ?? 'Free Agent'}
              </Badge>
              <Badge
                className="text-xs"
                style={{ backgroundColor: `${ratingColor}20`, color: ratingColor, borderColor: `${ratingColor}40` }}
              >
                {getRatingLabel(player.overallRating)}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Age</div>
                <div className="text-sm font-bold text-foreground">{player.age}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Height</div>
                <div className="text-sm font-bold text-foreground">{player.height ? `${player.height}cm` : '—'}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Foot</div>
                <div className="text-sm font-bold text-foreground capitalize">{player.preferredFoot}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Potential</div>
                <div className="text-sm font-bold" style={{ color: getRatingColor(player.potential) }}>{player.potential}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Market Value</div>
                <div className="text-sm font-bold text-primary">{formatCurrency(player.marketValue ?? 0)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        {attrs && (
          <div className="px-6 pb-6">
            {/* Main 6 stats */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-5">
              {MAIN_STATS.map(({ key, label }) => (
                <StatRow key={key} label={label} value={attrs[key] ?? 50} />
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Detailed Attributes</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {DETAIL_STATS.map(({ key, label }) => (
                  <StatRow key={key} label={label} value={(attrs as Record<string, number>)[key] ?? 50} />
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
