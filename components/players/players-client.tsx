'use client'

import { useState, useTransition, useCallback } from 'react'
import { getPlayers } from '@/app/actions/players'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlayerDetailModal } from './player-detail-modal'
import { formatCurrency, getRatingColor, POSITION_COLORS } from '@/lib/utils/format'
import type { PlayerWithDetails } from '@/lib/db/schema'
import Link from 'next/link'

const POSITIONS = ['ALL', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'CF', 'ST']

interface Props {
  initialPlayers: PlayerWithDetails[]
  initialTotal: number
  clubs: { id: number; name: string; shortName: string | null }[]
}

export function PlayersClient({ initialPlayers, initialTotal, clubs }: Props) {
  const [players, setPlayers] = useState(initialPlayers)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('ALL')
  const [sortBy, setSortBy] = useState<'overall_rating' | 'market_value' | 'age' | 'name'>('overall_rating')
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithDetails | null>(null)
  const [isPending, startTransition] = useTransition()

  const LIMIT = 24

  const fetchPlayers = useCallback((overrides: {
    search?: string; position?: string; sortBy?: string; page?: number
  } = {}) => {
    startTransition(async () => {
      const result = await getPlayers({
        search: overrides.search ?? search,
        position: (overrides.position ?? position) === 'ALL' ? undefined : (overrides.position ?? position),
        sortBy: (overrides.sortBy ?? sortBy) as typeof sortBy,
        sortDir: 'desc',
        page: overrides.page ?? page,
        limit: LIMIT,
      })
      setPlayers(result.players)
      setTotal(result.total)
    })
  }, [search, position, sortBy, page])

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
    fetchPlayers({ search: value, page: 1 })
  }

  function handlePosition(pos: string) {
    setPosition(pos)
    setPage(1)
    fetchPlayers({ position: pos, page: 1 })
  }

  function handleSort(val: string) {
    setSortBy(val as typeof sortBy)
    setPage(1)
    fetchPlayers({ sortBy: val, page: 1 })
  }

  function handlePage(p: number) {
    setPage(p)
    fetchPlayers({ page: p })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground" />
                <path d="M12 2L14.5 7.5L20 8L16 12L17 18L12 15L7 18L8 12L4 8L9.5 7.5L12 2Z" fill="currentColor" className="text-primary-foreground" />
              </svg>
            </div>
            <span className="font-bold text-foreground">DraftDay</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground text-sm">Player Database</span>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
            Back to Home
          </Button>
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground">Player Database</h1>
          <p className="text-muted-foreground mt-1">{total} players across top European leagues</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <Input
              placeholder="Search players..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
          <Select value={sortBy} onValueChange={(val) => val && handleSort(val)}>
            <SelectTrigger className="w-44 bg-card border-border">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall_rating">Overall Rating</SelectItem>
              <SelectItem value="market_value">Market Value</SelectItem>
              <SelectItem value="age">Age</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Position filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {POSITIONS.map(pos => (
            <button
              key={pos}
              onClick={() => handlePosition(pos)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                position === pos
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* Player grid */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          {players.map(player => (
            <PlayerGridCard
              key={player.id}
              player={player}
              onClick={() => setSelectedPlayer(player)}
            />
          ))}
        </div>

        {players.length === 0 && !isPending && (
          <div className="text-center py-16 text-muted-foreground">
            No players found matching your filters.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePage(page - 1)}
              disabled={page <= 1}
              className="border-border"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePage(page + 1)}
              disabled={page >= totalPages}
              className="border-border"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {selectedPlayer && (
        <PlayerDetailModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  )
}

function PlayerGridCard({ player, onClick }: { player: PlayerWithDetails; onClick: () => void }) {
  const ratingColor = getRatingColor(player.overallRating)
  const posColor = POSITION_COLORS[player.primaryPosition] ?? '#94a3b8'

  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-border bg-card p-3 text-left hover:border-primary/40 transition-all duration-150 hover:scale-[1.02] active:scale-100 flex flex-col gap-2"
    >
      {/* Rating + Position */}
      <div className="flex items-start justify-between">
        <div className="text-2xl font-black leading-none" style={{ color: ratingColor }}>
          {player.overallRating}
        </div>
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${posColor}20`, color: posColor }}
        >
          {player.primaryPosition}
        </span>
      </div>

      {/* Name */}
      <div>
        <div className="text-xs font-bold text-foreground truncate">{player.name}</div>
        <div className="text-[10px] text-muted-foreground truncate">{player.club?.name ?? 'Free Agent'}</div>
      </div>

      {/* Country + market value */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs">{player.country?.flagEmoji}</span>
        <span className="text-[10px] text-muted-foreground">{formatCurrency(player.marketValue ?? 0)}</span>
      </div>
    </button>
  )
}
