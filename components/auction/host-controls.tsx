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
        <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-50 p-3 space-y-2">
          {/* Current info */}
          <div className="text-xs text-muted-foreground mb-3 p-2 bg-background rounded-lg">
            <div className="font-semibold text-foreground">{currentPlayer.name}</div>
            <div className="mt-1">
              {currentBid > 0 ? (
                <>
                  <div>Current bid: <span className="font-bold text-primary">{formatCurrency(currentBid)}</span></div>
                  <div>By: <span className="font-bold">{currentBidder?.displayName || 'Unknown'}</span></div>
                </>
              ) : (
                <div className="text-muted-foreground">No bids yet</div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <Button
            onClick={handleFinalizeSale}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <SkipForward className="w-3 h-3" />
            {currentBid > 0 ? 'Finalize Sale' : 'Skip Player'}
          </Button>

          <div className="space-y-2 text-xs text-muted-foreground">
            <p>⏱️ Timer auto-finalizes on expiry</p>
            <p>📍 Click to finalize sale immediately</p>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
