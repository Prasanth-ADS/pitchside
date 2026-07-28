'use client'

import { useAuctionStore } from '@/lib/auction-store'
import { formatCurrency, POSITION_COLORS } from '@/lib/utils/format'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Participant } from '@/lib/db/schema'

interface Props {
  myId: string | null
  compact?: boolean
}

export function TeamSidebar({ myId, compact = false }: Props) {
  const { participants, teams, teamBudgets, myParticipantId } = useAuctionStore()

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        {participants.map((p: Participant) => {
          const isMe = p.id === myParticipantId
          const budget = teamBudgets[p.id] ?? p.budgetRemaining
          const squad = teams[p.id] ?? []

          return (
            <div
              key={p.id}
              className={`rounded-xl border p-3 transition-colors ${
                isMe ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
              }`}
            >
              {/* Participant header */}
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: p.avatarColor }}
                >
                  {p.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">
                    {p.displayName}{isMe ? ' (You)' : ''}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{formatCurrency(budget)} left</div>
                </div>
                <div className="text-[10px] text-muted-foreground text-right flex-shrink-0">
                  {squad.length}p
                </div>
              </div>

              {/* Budget bar */}
              <div className="h-1 rounded-full bg-background overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (budget / (useAuctionStore.getState().room?.budgetPerTeam ?? 1)) * 100)}%`,
                    backgroundColor: p.avatarColor,
                    opacity: 0.7,
                  }}
                />
              </div>

              {/* Players list */}
              {squad.length > 0 && (
                <div className="space-y-1 mt-2">
                  {squad.slice(0, compact ? 5 : 15).map(player => (
                    <div key={player.id} className="flex items-center gap-1.5 text-[10px]">
                      <span
                        className="w-8 rounded px-1 py-0.5 text-center font-bold flex-shrink-0"
                        style={{
                          backgroundColor: `${POSITION_COLORS[player.primaryPosition] ?? '#94a3b8'}20`,
                          color: POSITION_COLORS[player.primaryPosition] ?? '#94a3b8',
                        }}
                      >
                        {player.primaryPosition}
                      </span>
                      <span className="text-foreground truncate flex-1">{player.name}</span>
                      <span className="text-muted-foreground flex-shrink-0">{player.overallRating}</span>
                    </div>
                  ))}
                  {squad.length > (compact ? 5 : 15) && (
                    <div className="text-[10px] text-muted-foreground text-center">
                      +{squad.length - (compact ? 5 : 15)} more
                    </div>
                  )}
                </div>
              )}

              {squad.length === 0 && (
                <div className="text-[10px] text-muted-foreground text-center py-1">No players yet</div>
              )}
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
