'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuctionStore } from '@/lib/auction-store'
import { useAuctionSSE } from '@/hooks/use-auction-sse'
import { AuctionHeader } from './auction-header'
import { PlayerCard } from './player-card'
import { BidPanel } from './bid-panel'
import { TeamSidebar } from './team-sidebar'
import { ChatPanel } from './chat-panel'
import { BidHistoryList } from './bid-history-list'
import { HostControls } from './host-controls'
import type { RoomSnapshot } from '@/lib/auction-store'

interface Props {
  initialSnapshot: RoomSnapshot
  roomCode: string
}

export function AuctionClient({ initialSnapshot, roomCode }: Props) {
  const router = useRouter()
  const { applySnapshot, setIdentity, room } = useAuctionStore()
  const [myId, setMyId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'teams' | 'chat'>('chat')

  useEffect(() => {
    applySnapshot(initialSnapshot)
    const storedId = sessionStorage.getItem(`draftday_id_${roomCode}`)
    if (storedId) {
      setMyId(storedId)
      const me = initialSnapshot.participants.find(p => p.id === storedId)
      if (me) setIdentity(me.id, me.displayName, me.avatarColor)
    }
  }, []) // eslint-disable-line

  useAuctionSSE(roomCode, myId ?? '')

  // Redirect when auction ends
  useEffect(() => {
    if (room?.status === 'ended') {
      router.push(`/room/${roomCode}/results`)
    }
  }, [room?.status]) // eslint-disable-line

  const isHost = room?.hostId === myId

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <AuctionHeader roomCode={roomCode} myId={myId} isHost={isHost} />

      {/* Main layout: left sidebar | center stage | right sidebar */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left: Team sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-border overflow-y-auto hidden lg:block">
          <TeamSidebar myId={myId} />
        </aside>

        {/* Center: Player card + bidding */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 overflow-y-auto">
            <PlayerCard />
            <BidPanel roomCode={roomCode} myId={myId} isHost={isHost} />
            {isHost && <HostControls roomCode={roomCode} myId={myId} />}
          </div>
          <BidHistoryList />
        </main>

        {/* Right: Chat / Teams tabs */}
        <aside className="w-72 flex-shrink-0 border-l border-border flex flex-col">
          {/* Tab toggle */}
          <div className="flex border-b border-border">
            {(['chat', 'teams'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'chat' ? 'Live Chat' : 'Teams'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat'
              ? <ChatPanel roomCode={roomCode} myId={myId} />
              : <TeamSidebar myId={myId} compact />
            }
          </div>
        </aside>
      </div>
    </div>
  )
}
