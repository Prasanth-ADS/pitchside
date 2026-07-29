'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useAuctionStore } from '@/lib/auction-store'
import { placeBid } from '@/app/actions/rooms'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils/format'

const QUICK_BID_INCREMENTS = [500_000, 1_000_000, 2_500_000, 5_000_000]

interface Props {
  roomCode: string
  myId: string | null
  isHost: boolean
}

export function BidPanel({ roomCode, myId, isHost }: Props) {
  const { currentPlayer, currentBid, currentBidderId, timerEnd, participants, teamBudgets, myParticipantId, applyBidPlaced } = useAuctionStore()
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const myBudget = myParticipantId ? (teamBudgets[myParticipantId] ?? 0) : 0
  const currentBidder = participants.find(p => p.id === currentBidderId)
  const isMyBid = currentBidderId === myParticipantId

  // Countdown timer
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (!timerEnd) { setTimeLeft(0); return }

    function tick() {
      const remaining = Math.max(0, Math.ceil((timerEnd! - Date.now()) / 1000))
      setTimeLeft(remaining)
    }
    tick()
    intervalRef.current = setInterval(tick, 200)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [timerEnd])

  const handleBid = useCallback(async (amount: number) => {
    if (!myId || !currentPlayer || loading) return
    if (amount <= currentBid) {
      setError(`Bid must be above ${formatCurrency(currentBid)}`)
      return
    }
    if (amount > myBudget) {
      setError('Insufficient budget')
      return
    }
    setLoading(true)
    setError('')
    const result = await placeBid({ roomCode, participantId: myId, amount })
    if (result.error) setError(result.error)
    if (result.bid && result.roomUpdate) applyBidPlaced(result.bid, result.roomUpdate)
    setLoading(false)
    setCustomAmount('')
  }, [myId, currentPlayer, loading, currentBid, myBudget, roomCode, applyBidPlaced])

  const handleCustomBid = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(customAmount.replace(/[^0-9.]/g, '')) * 1_000_000
    if (!isNaN(parsed) && parsed > 0) handleBid(Math.round(parsed))
  }, [customAmount, handleBid])

  const isTimerCritical = timeLeft <= 10 && timeLeft > 0
  const minNextBid = currentBid > 0 ? currentBid + 500_000 : 1_000_000

  if (!currentPlayer) return null

  return (
    <div className="w-full max-w-md space-y-3" role="region" aria-label="Bidding panel">
      {/* Timer + current bid */}
      <div className="rounded-2xl border border-border bg-card p-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1" id="bid-label">Current Bid</div>
          <div className={`text-2xl font-black ${currentBid > 0 ? 'text-primary' : 'text-muted-foreground'}`} aria-live="polite" aria-describedby="bid-label">
            {currentBid > 0 ? formatCurrency(currentBid) : 'No bids yet'}
          </div>
          {currentBidder && (
            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5" aria-live="polite">
              <span
                className="w-4 h-4 rounded-full inline-flex items-center justify-center text-[9px] font-bold text-white"
                style={{ backgroundColor: currentBidder.avatarColor }}
                aria-label={`Avatar for ${currentBidder.displayName}`}
              >
                {currentBidder.displayName.charAt(0)}
              </span>
              <span className={isMyBid ? 'text-primary font-semibold' : ''} role="status">{isMyBid ? 'You' : currentBidder.displayName}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1" id="timer-label">Timer</div>
          <div className={`text-3xl font-black tabular-nums ${isTimerCritical ? 'text-red-400 timer-critical' : 'text-foreground'}`} aria-live="polite" aria-describedby="timer-label" role="status">
            {timeLeft}s
          </div>
        </div>
      </div>

      {/* Timer progress bar */}
      <div className="h-1.5 rounded-full bg-card overflow-hidden border border-border" role="progressbar" aria-valuenow={timerPercent} aria-valuemin={0} aria-valuemax={100} aria-label="Auction timer progress">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${timerEnd ? Math.max(0, ((timerEnd - Date.now()) / ((useAuctionStore.getState().room?.timerSeconds ?? 60) * 1000)) * 100) : 0}%`,
            backgroundColor: isTimerCritical ? '#ef4444' : '#f59e0b',
          }}
        />
      </div>

      {/* Quick bid buttons */}
      <fieldset className="grid grid-cols-4 gap-2">
        <legend className="sr-only">Quick bid amounts</legend>
        {QUICK_BID_INCREMENTS.map(inc => {
          const bid = Math.max(minNextBid, currentBid + inc)
          const canAfford = bid <= myBudget
          return (
            <button
              key={inc}
              onClick={() => handleBid(bid)}
              disabled={loading || !canAfford || isMyBid}
              aria-label={`Place bid of ${formatCurrency(bid)}`}
              className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                canAfford && !isMyBid
                  ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/50 active:scale-95'
                  : 'border-border text-muted-foreground opacity-40 cursor-not-allowed'
              }`}
            >
              {formatCurrency(bid)}
            </button>
          )
        })}
      </fieldset>

      {/* Custom bid */}
      <form onSubmit={handleCustomBid} className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor="custom-bid-input" className="sr-only">Enter custom bid amount in millions</label>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold" aria-hidden="true">£</span>
          <Input
            id="custom-bid-input"
            value={customAmount}
            onChange={e => setCustomAmount(e.target.value)}
            placeholder="e.g. 45 (million)"
            className="pl-7 bg-card border-border"
            type="number"
            step="0.5"
            min="0"
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !customAmount || isMyBid}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-5"
          aria-label={`Place custom bid of ${customAmount} million pounds`}
        >
          Bid
        </Button>
      </form>

      {isMyBid && (
        <p className="text-center text-xs text-primary font-semibold" role="status">You are the highest bidder!</p>
      )}

      {error && <p className="text-center text-xs text-destructive" role="alert">{error}</p>}

      <div className="text-center text-[10px] text-muted-foreground">
        Your budget: <span className="font-bold text-foreground">{formatCurrency(myBudget)}</span>
        {' '}· Min next bid: <span className="font-bold">{formatCurrency(minNextBid)}</span>
      </div>
    </div>
  )
}
