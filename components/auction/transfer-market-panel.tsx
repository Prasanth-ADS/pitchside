'use client'

import { useAuctionStore } from '@/lib/auction-store'
import { formatCurrency, getRatingColor, POSITION_COLORS } from '@/lib/utils/format'

export function TransferMarketPanel() {
  const { marketPlayers } = useAuctionStore()

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Transfer Market</h3>
        <p className="text-[10px] text-muted-foreground mt-1">
          Upcoming unsold players queued between auction rounds.
        </p>
      </div>

      {marketPlayers.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-4 text-center text-xs text-muted-foreground">
          Market is loading the next available players...
        </div>
      ) : (
        <div className="space-y-2">
          {marketPlayers.map((player) => {
            const ratingColor = getRatingColor(player.overallRating)
            const posColor = POSITION_COLORS[player.primaryPosition] ?? '#94a3b8'

            return (
              <div key={player.id} className="rounded-xl border border-border bg-card p-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl font-black leading-none" style={{ color: ratingColor }}>
                    {player.overallRating}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-foreground">{player.name}</div>
                    <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                      {player.club?.name ?? 'Free Agent'} · Age {player.age}
                    </div>
                  </div>
                  <span
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-black"
                    style={{ backgroundColor: `${posColor}20`, color: posColor }}
                  >
                    {player.primaryPosition}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{player.country?.flagEmoji} {player.country?.name ?? 'Unknown'}</span>
                  <span className="font-bold text-primary">{formatCurrency(player.marketValue ?? 0)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
