'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuctionStore } from '@/lib/auction-store'
import { useAuctionSSE } from '@/hooks/use-auction-sse'
import { startAuction } from '@/app/actions/rooms'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils/format'
import type { RoomSnapshot } from '@/lib/auction-store'
import type { Participant } from '@/lib/db/schema'

const COLOR_LABELS: Record<string, string> = {
  '#ef4444': 'Red', '#f97316': 'Orange', '#eab308': 'Yellow',
  '#22c55e': 'Green', '#14b8a6': 'Teal', '#3b82f6': 'Blue',
  '#8b5cf6': 'Purple', '#ec4899': 'Pink', '#06b6d4': 'Cyan',
  '#a855f7': 'Violet', '#f43f5e': 'Rose', '#10b981': 'Emerald',
}

interface Props {
  initialSnapshot: RoomSnapshot
  roomCode: string
}

export function LobbyClient({ initialSnapshot, roomCode }: Props) {
  const router = useRouter()
  const { applySnapshot, setIdentity, participants, room, sseStatus, applyRoomStarted } = useAuctionStore()
  const [myId, setMyId] = useState<string | null>(null)
  const [startLoading, setStartLoading] = useState(false)
  const [startError, setStartError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    applySnapshot(initialSnapshot)
    const storedId = sessionStorage.getItem(`draftday_id_${roomCode}`)
    if (storedId) {
      setMyId(storedId)
      const me = initialSnapshot.participants.find(p => p.id === storedId)
      if (me) setIdentity(me.id, me.displayName, me.avatarColor)
    }
  }, []) // eslint-disable-line

  // SSE connection
  useAuctionSSE(roomCode, myId ?? '')

  // Redirect to auction when room starts
  useEffect(() => {
    if (room?.status === 'active') {
      router.push(`/room/${roomCode}/auction`)
    }
  }, [room?.status]) // eslint-disable-line

  function handleCopy() {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleStart() {
    if (!myId) return
    setStartLoading(true)
    setStartError('')
    const result = await startAuction(roomCode, myId)
    if (result.error) {
      setStartError(result.error)
      setStartLoading(false)
      return
    }
    applyRoomStarted({ status: 'active' })
    router.push(`/room/${roomCode}/auction`)
  }

  const isHost = room?.hostId === myId
  const me = participants.find(p => p.id === myId)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground" />
              <path d="M12 2L14.5 7.5L20 8L16 12L17 18L12 15L7 18L8 12L4 8L9.5 7.5L12 2Z" fill="currentColor" className="text-primary-foreground" />
            </svg>
          </div>
          <span className="font-bold text-foreground">DraftDay</span>
          <Separator orientation="vertical" className="h-5 mx-1" />
          <span className="text-muted-foreground text-sm">{room?.name ?? 'Loading...'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${sseStatus === 'connected' ? 'bg-green-500' : sseStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground capitalize">{sseStatus}</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-6">
          {/* Room code card */}
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Share This Code</div>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-5xl font-black tracking-[0.2em] text-primary font-mono">{roomCode}</span>
              <button
                onClick={handleCopy}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Friends can join at <span className="text-foreground font-medium">draftday.app</span> using this code
            </p>
          </div>

          {/* Participants */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-foreground">
                Participants
                <span className="ml-2 text-muted-foreground font-normal text-sm">({participants.length} joined)</span>
              </h2>
              <Badge variant="secondary" className="text-xs">
                Lobby
              </Badge>
            </div>

            <div className="space-y-2">
              {participants.map((p: Participant) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-border">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm truncate">{p.displayName}</span>
                      {p.isHost && (
                        <Badge variant="outline" className="text-[10px] border-primary/40 text-primary px-1.5 py-0">Host</Badge>
                      )}
                      {p.id === myId && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">You</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Budget: {formatCurrency(p.budgetRemaining)} &middot; {COLOR_LABELS[p.avatarColor] ?? 'Team'}
                    </div>
                  </div>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.avatarColor }} />
                </div>
              ))}

              {participants.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Waiting for participants to join...
                </div>
              )}
            </div>
          </div>

          {/* Room settings summary */}
          {room && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Room Settings</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Budget', value: formatCurrency(room.budgetPerTeam) },
                  { label: 'Timer', value: `${room.timerSeconds}s` },
                  { label: 'Max Squad', value: `${room.maxPlayersPerTeam} players` },
                  { label: 'Min Squad', value: `${room.minPlayersPerTeam} players` },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-lg font-black text-primary">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start button (host only) */}
          {isHost && (
            <div className="space-y-2">
              {startError && <p className="text-destructive text-sm text-center">{startError}</p>}
              <Button
                size="lg"
                onClick={handleStart}
                disabled={startLoading || participants.length < 1}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-black text-base h-13 gold-glow"
              >
                {startLoading ? 'Starting Auction...' : 'Start Auction'}
              </Button>
              {participants.length < 2 && (
                <p className="text-xs text-muted-foreground text-center">
                  You can start with just yourself, or wait for more players to join.
                </p>
              )}
            </div>
          )}

          {!isHost && (
            <div className="text-center py-4 rounded-2xl border border-border bg-card">
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Waiting for the host to start the auction...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
