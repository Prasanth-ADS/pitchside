'use client'

import { useAuctionStore } from '@/lib/auction-store'
import { finalizePlayerSale } from '@/app/actions/rooms'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import { useState } from 'react'

interface Props {
  roomCode: string
  myId: string | null
  isHost: boolean
}

export function AuctionHeader({ roomCode, myId, isHost }: Props) {
  const { room, participants, sseStatus, myParticipantId, teamBudgets } = useAuctionStore()
  const [finalizing, setFinalizing] = useState(false)

  const me = participants.find(p => p.id === myParticipantId)
  const myBudget = myParticipantId ? (teamBudgets[myParticipantId] ?? 0) : 0

  async function handleFinalize() {
    if (!myId) return
    setFinalizing(true)
    await finalizePlayerSale({ roomCode, hostParticipantId: myId })
    setFinalizing(false)
  }

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 flex-shrink-0 gap-4">
      {/* Left: Logo + room */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground" />
            <path d="M12 2L14.5 7.5L20 8L16 12L17 18L12 15L7 18L8 12L4 8L9.5 7.5L12 2Z" fill="currentColor" className="text-primary-foreground" />
          </svg>
        </div>
        <span className="font-bold text-foreground hidden sm:block">DraftDay</span>
        <span className="text-muted-foreground font-mono text-sm hidden sm:block">{roomCode}</span>
        <Badge
          variant={room?.status === 'active' ? 'default' : 'secondary'}
          className={`text-[10px] ${room?.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}`}
        >
          {room?.status === 'active' ? 'LIVE' : room?.status?.toUpperCase() ?? 'LOADING'}
        </Badge>
      </div>

      {/* Center: My budget */}
      {me && (
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl border border-border bg-card">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: me.avatarColor }}
          >
            {me.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider leading-none">Your Budget</div>
            <div className="text-sm font-black text-primary leading-tight">{formatCurrency(myBudget)}</div>
          </div>
        </div>
      )}

      {/* Right: SSE status + finalize btn */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${sseStatus === 'connected' ? 'bg-green-500' : sseStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] text-muted-foreground hidden sm:block capitalize">{sseStatus}</span>
        </div>
        {isHost && room?.status === 'active' && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleFinalize}
            disabled={finalizing}
            className="text-xs border-primary/30 text-primary hover:bg-primary/10 h-7"
          >
            {finalizing ? 'Finalizing...' : 'Sell & Next'}
          </Button>
        )}
      </div>
    </header>
  )
}
