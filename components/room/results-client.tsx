'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, getRatingColor, POSITION_COLORS, POSITION_ORDER } from '@/lib/utils/format'
import type { RoomSnapshot } from '@/lib/auction-store'
import type { PlayerWithDetails } from '@/lib/db/schema'

interface Props {
  snapshot: RoomSnapshot
  roomCode: string
}

export function ResultsClient({ snapshot, roomCode }: Props) {
  const { participants, teams, teamBudgets, room } = snapshot
  const [activeTab, setActiveTab] = useState(participants[0]?.id ?? '')

  // Sort participants by squad rating (desc)
  const rankedParticipants = [...participants].sort((a, b) => {
    const aSquad = teams[a.id] ?? []
    const bSquad = teams[b.id] ?? []
    const aAvg = aSquad.length > 0 ? aSquad.reduce((s, p) => s + p.overallRating, 0) / aSquad.length : 0
    const bAvg = bSquad.length > 0 ? bSquad.reduce((s, p) => s + p.overallRating, 0) / bSquad.length : 0
    return bAvg - aAvg
  })

  return (
    <div className="min-h-screen bg-background">
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
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground text-sm">{room?.name}</span>
          <Badge className="bg-green-500/15 text-green-400 border-green-500/30 text-[10px]">FINAL</Badge>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="border-border text-xs">
            New Room
          </Button>
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-foreground mb-2">Auction Complete</h1>
          <p className="text-muted-foreground">
            Room <span className="font-mono text-foreground font-bold">{roomCode}</span> &middot; {participants.length} managers &middot; {Object.values(teams).reduce((s, t) => s + t.length, 0)} players sold
          </p>
        </div>

        {/* Leaderboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {rankedParticipants.slice(0, 3).map((p, i) => {
            const squad = teams[p.id] ?? []
            const budget = teamBudgets[p.id] ?? p.budgetRemaining
            const spent = (room?.budgetPerTeam ?? 0) - budget
            const avgRating = squad.length > 0
              ? Math.round(squad.reduce((s, pl) => s + pl.overallRating, 0) / squad.length)
              : 0
            const medals = ['gold-glow border-primary/40', 'border-border', 'border-border']

            return (
              <div
                key={p.id}
                className={`rounded-2xl border bg-card p-5 ${medals[i]} relative overflow-hidden`}
              >
                {i === 0 && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, oklch(0.82 0.18 85 / 8%), transparent 70%)' }}
                  />
                )}
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'}`}>
                      {i + 1}
                    </div>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: p.avatarColor }}
                    >
                      {p.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{p.displayName}</div>
                      {p.isHost && <div className="text-[10px] text-muted-foreground">Host</div>}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-xl font-black text-primary">{avgRating}</div>
                      <div className="text-[10px] text-muted-foreground">Avg Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-black text-foreground">{squad.length}</div>
                      <div className="text-[10px] text-muted-foreground">Players</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-black text-foreground">{formatCurrency(spent)}</div>
                      <div className="text-[10px] text-muted-foreground">Spent</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Squad details tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border h-auto p-1 flex flex-wrap gap-1 mb-6">
            {participants.map(p => (
              <TabsTrigger
                key={p.id}
                value={p.id}
                className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1.5"
              >
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.avatarColor }}
                />
                {p.displayName}
              </TabsTrigger>
            ))}
          </TabsList>

          {participants.map(p => {
            const squad = teams[p.id] ?? []
            const budget = teamBudgets[p.id] ?? p.budgetRemaining
            const spent = (room?.budgetPerTeam ?? 0) - budget
            const sortedSquad = [...squad].sort((a, b) => {
              const ai = POSITION_ORDER.indexOf(a.primaryPosition)
              const bi = POSITION_ORDER.indexOf(b.primaryPosition)
              return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
            })

            return (
              <TabsContent key={p.id} value={p.id}>
                <SquadView
                  participant={p}
                  squad={sortedSquad}
                  spent={spent}
                  budgetRemaining={budget}
                  totalBudget={room?.budgetPerTeam ?? 0}
                />
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}

function SquadView({
  participant, squad, spent, budgetRemaining, totalBudget,
}: {
  participant: { id: string; displayName: string; avatarColor: string }
  squad: PlayerWithDetails[]
  spent: number
  budgetRemaining: number
  totalBudget: number
}) {
  const avgRating = squad.length > 0
    ? Math.round(squad.reduce((s, p) => s + p.overallRating, 0) / squad.length)
    : 0

  const byPosition = squad.reduce<Record<string, PlayerWithDetails[]>>((acc, p) => {
    const group = p.primaryPosition
    acc[group] = [...(acc[group] ?? []), p]
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* Squad stats bar */}
      <div className="rounded-2xl border border-border bg-card p-5 flex flex-wrap gap-6">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Manager</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: participant.avatarColor }}>
              {participant.displayName.charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-foreground">{participant.displayName}</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Rating</div>
          <div className="text-xl font-black mt-1" style={{ color: getRatingColor(avgRating) }}>{avgRating}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Squad Size</div>
          <div className="text-xl font-black text-foreground mt-1">{squad.length}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Spent</div>
          <div className="text-xl font-black text-primary mt-1">{formatCurrency(spent)}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Remaining</div>
          <div className="text-xl font-black text-foreground mt-1">{formatCurrency(budgetRemaining)}</div>
        </div>
        {/* Budget bar */}
        <div className="w-full h-1.5 rounded-full bg-background overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, (spent / totalBudget) * 100)}%`, backgroundColor: participant.avatarColor }}
          />
        </div>
      </div>

      {/* Players by position */}
      {POSITION_ORDER.filter(pos => byPosition[pos]?.length > 0).map(pos => (
        <div key={pos}>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: `${POSITION_COLORS[pos] ?? '#94a3b8'}20`, color: POSITION_COLORS[pos] ?? '#94a3b8' }}
            >
              {pos}
            </span>
            <span className="text-xs text-muted-foreground">{byPosition[pos].length} player{byPosition[pos].length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {byPosition[pos].map(player => (
              <div
                key={player.id}
                className="rounded-xl border border-border bg-card p-3 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black leading-none" style={{ color: getRatingColor(player.overallRating) }}>
                    {player.overallRating}
                  </span>
                  <span className="text-[9px]">{player.country?.flagEmoji}</span>
                </div>
                <div className="text-xs font-semibold text-foreground truncate">{player.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{player.club?.shortName ?? player.club?.name ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {squad.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No players acquired.</div>
      )}
    </div>
  )
}
