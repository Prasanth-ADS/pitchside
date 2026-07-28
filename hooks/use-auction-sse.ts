'use client'

import { useEffect, useRef } from 'react'
import { useAuctionStore } from '@/lib/auction-store'
import type { SSEEventType } from '@/lib/sse-broadcaster'
import type { RoomSnapshot, BidEntry, PlayerSoldPayload } from '@/lib/auction-store'
import type { ChatMessage, Participant, Room, PlayerWithDetails } from '@/lib/db/schema'

export function useAuctionSSE(roomCode: string, participantId: string) {
  const store = useAuctionStore()
  const esRef = useRef<EventSource | null>(null)
  const retryCountRef = useRef(0)

  useEffect(() => {
    if (!roomCode || !participantId) return

    let cancelled = false

    function connect() {
      if (cancelled) return

      store.setSseStatus('connecting')
      const url = `/api/rooms/${roomCode}/sse?pid=${encodeURIComponent(participantId)}`
      const es = new EventSource(url)
      esRef.current = es
      retryCountRef.current = 0

      es.onopen = () => {
        if (!cancelled) {
          store.setSseStatus('connected')
          retryCountRef.current = 0
        }
      }

      es.onmessage = (event) => {
        if (cancelled) return
        try {
          const parsed = JSON.parse(event.data) as { type: SSEEventType; payload: unknown; ts: number }
          handleEvent(parsed.type, parsed.payload, store)
        } catch {
          // non-JSON keep-alive comments pass through as empty strings — safe to ignore
        }
      }

      es.onerror = () => {
        es.close()
        if (!cancelled) {
          store.setSseStatus('disconnected')
          const delay = Math.min(1000 * 2 ** retryCountRef.current, 30000)
          retryCountRef.current += 1
          setTimeout(connect, delay)
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      esRef.current?.close()
      esRef.current = null
    }
  }, [roomCode, participantId])
}

function handleEvent(type: SSEEventType, payload: unknown, store: ReturnType<typeof useAuctionStore.getState>) {
  switch (type) {
    case 'room:snapshot': {
      store.applySnapshot(payload as RoomSnapshot)
      break
    }
    case 'bid:placed': {
      const p = payload as { bid: BidEntry; roomUpdate: Partial<Room> }
      store.applyBidPlaced(p.bid, p.roomUpdate)
      break
    }
    case 'auction:next_player': {
      const p = payload as { player: PlayerWithDetails; roomUpdate: Partial<Room> }
      store.applyNextPlayer(p.player, p.roomUpdate)
      break
    }
    case 'auction:player_sold': {
      store.applyPlayerSold(payload as PlayerSoldPayload)
      break
    }
    case 'auction:timer_update': {
      store.applyTimerUpdate(payload as number)
      break
    }
    case 'auction:ended': {
      store.applyAuctionEnded()
      break
    }
    case 'chat:message': {
      store.applyChat(payload as ChatMessage)
      break
    }
    case 'participant:joined': {
      store.applyParticipantJoined(payload as Participant)
      break
    }
    case 'participant:left': {
      store.applyParticipantLeft(payload as string)
      break
    }
    case 'room:started': {
      store.applyRoomStarted(payload as Partial<Room>)
      break
    }
  }
}
