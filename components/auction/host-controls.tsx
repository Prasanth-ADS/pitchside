'use client'

import { useState } from 'react'
import { useAuctionStore } from '@/lib/auction-store'
import { finalizePlayerSale } from '@/app/actions/rooms'
import { Button } from '@/components/ui/button'
import { ChevronDown, SkipForward, Undo2, Pause, Play } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'

interface Props {
  roomCode: string
  myId: string | null
}

export function HostControls({ roomCode, myId }: Props) {
  const { room, currentPlayer, currentBid, currentBidderId, participants } = useAuctionStore()
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')

  const isHost = room?.hostId === myId

  if (!isHost || !currentPlayer) return null

  const currentBidder = participants.find(p => p.id === currentBidderId)

  const handleFinalizeSale = async () => {
    if (!myId || loading) return
    setLoading(true)
    setError('')
    const result = await finalizePlayerSale({ roomCode, hostParticipantId: myId })
    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-xs font-semibold transition-all"
      >
        <span>🎛️ Controls</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl z-50 p-4 space-y-3">
          {/* Skip Player button - prominent position */}
          <Button
            onClick={handleFinalizeSale}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <SkipForward className="w-4 h-4" />
            {currentBid > 0 ? 'Finalize Sale' : 'Skip Player'}
          </Button>

          {/* Current info */}
          <div className="text-xs text-muted-foreground p-3 bg-background rounded-lg border border-border/50">
            <div className="font-semibold text-foreground mb-2">{currentPlayer.name}</div>
            <div className="space-y-1">
              {currentBid > 0 ? (
                <>
                  <div>Current bid: <span className="font-bold text-primary">{formatCurrency(currentBid)}</span></div>
                  <div>By: <span className="font-bold">{currentBidder?.displayName || 'Unknown'}</span></div>
                </>
              ) : (
                <div className="text-muted-foreground italic">No bids yet</div>
              )}
            </div>
          </div>

          {/* Info messages */}
          <div className="space-y-1.5 text-[11px] text-muted-foreground bg-background rounded-lg p-2">
            <p className="flex items-center gap-1.5"><span>⏱️</span> Timer auto-finalizes on expiry</p>
            <p className="flex items-center gap-1.5"><span>✓</span> Or click button to finalize now</p>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg border border-destructive/20">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
