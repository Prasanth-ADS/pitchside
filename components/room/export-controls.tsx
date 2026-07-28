'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileJson, FileText } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import type { RoomSnapshot } from '@/lib/auction-store'
import type { PlayerWithDetails, Participant } from '@/lib/db/schema'

interface Props {
  snapshot: RoomSnapshot
  roomCode: string
}

export function ExportControls({ snapshot, roomCode }: Props) {
  const { participants, teams, teamBudgets, room } = snapshot
  const [loading, setLoading] = useState<'csv' | 'json' | null>(null)

  const exportAsCSV = () => {
    setLoading('csv')
    try {
      const rows: string[][] = []

      // Header
      rows.push(['DraftDay Results Export'])
      rows.push(['Room Code', roomCode])
      rows.push(['Room Name', room?.name ?? 'Unknown'])
      rows.push(['Date', new Date().toLocaleString()])
      rows.push([])

      // Leaderboard
      rows.push(['Leaderboard'])
      rows.push(['Rank', 'Manager', 'Players', 'Avg Rating', 'Total Spent', 'Remaining Budget'])

      const rankedParticipants = [...participants].sort((a, b) => {
        const aSquad = teams[a.id] ?? []
        const bSquad = teams[b.id] ?? []
        const aAvg = aSquad.length > 0 ? aSquad.reduce((s, p) => s + p.overallRating, 0) / aSquad.length : 0
        const bAvg = bSquad.length > 0 ? bSquad.reduce((s, p) => s + p.overallRating, 0) / bSquad.length : 0
        return bAvg - aAvg
      })

      rankedParticipants.forEach((p, i) => {
        const squad = teams[p.id] ?? []
        const budget = teamBudgets[p.id] ?? p.budgetRemaining
        const spent = (room?.budgetPerTeam ?? 0) - budget
        const avgRating = squad.length > 0
          ? Math.round(squad.reduce((s, pl) => s + pl.overallRating, 0) / squad.length)
          : 0

        rows.push([
          (i + 1).toString(),
          p.displayName,
          squad.length.toString(),
          avgRating.toString(),
          spent.toString(),
          budget.toString(),
        ])
      })

      rows.push([])

      // Each manager's squad
      rankedParticipants.forEach(p => {
        rows.push([])
        rows.push([`Squad: ${p.displayName}`])
        rows.push(['Player', 'Position', 'Rating', 'Club', 'Age', 'Country'])

        const squad = teams[p.id] ?? []
        squad.forEach(player => {
          rows.push([
            player.name,
            player.primaryPosition,
            player.overallRating.toString(),
            player.club?.name ?? 'Free Agent',
            player.age.toString(),
            player.country?.name ?? 'Unknown',
          ])
        })
      })

      // Convert to CSV
      const csv = rows.map(row => row.map(cell => `"${cell?.toString().replace(/"/g, '""') ?? ''}"`).join(',')).join('\n')

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `draftday-${roomCode}-${Date.now()}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setLoading(null)
    }
  }

  const exportAsJSON = () => {
    setLoading('json')
    try {
      const data = {
        room: {
          code: roomCode,
          name: room?.name,
          status: room?.status,
          budgetPerTeam: room?.budgetPerTeam,
          exportedAt: new Date().toISOString(),
        },
        statistics: {
          totalManagers: participants.length,
          totalPlayers: Object.values(teams).reduce((s, t) => s + t.length, 0),
          totalBudget: (room?.budgetPerTeam ?? 0) * participants.length,
          totalSpent: Object.entries(teamBudgets).reduce(
            (s, [pId, budget]) => s + ((room?.budgetPerTeam ?? 0) - budget),
            0,
          ),
        },
        standings: participants
          .map(p => {
            const squad = teams[p.id] ?? []
            const budget = teamBudgets[p.id] ?? p.budgetRemaining
            const spent = (room?.budgetPerTeam ?? 0) - budget
            return {
              manager: p.displayName,
              isHost: p.isHost,
              squadSize: squad.length,
              averageRating: squad.length > 0
                ? Math.round(squad.reduce((s, pl) => s + pl.overallRating, 0) / squad.length)
                : 0,
              totalSpent: spent,
              budgetRemaining: budget,
            }
          })
          .sort((a, b) => b.averageRating - a.averageRating),
        squads: Object.fromEntries(
          participants.map(p => [
            p.displayName,
            {
              players: (teams[p.id] ?? []).map(player => ({
                name: player.name,
                position: player.primaryPosition,
                rating: player.overallRating,
                potential: player.potential,
                club: player.club?.name,
                country: player.country?.name,
                age: player.age,
              })),
              stats: {
                count: (teams[p.id] ?? []).length,
                avgRating: (teams[p.id] ?? []).length > 0
                  ? Math.round((teams[p.id] ?? []).reduce((s, pl) => s + pl.overallRating, 0) / (teams[p.id] ?? []).length)
                  : 0,
              },
            },
          ]),
        ),
      }

      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `draftday-${roomCode}-${Date.now()}.json`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="text-xs text-muted-foreground">Export results:</div>
      <Button
        onClick={exportAsCSV}
        disabled={loading !== null}
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs border-border hover:bg-background"
      >
        <FileText className="w-4 h-4" />
        {loading === 'csv' ? 'Exporting...' : 'CSV'}
      </Button>
      <Button
        onClick={exportAsJSON}
        disabled={loading !== null}
        size="sm"
        variant="outline"
        className="gap-1.5 text-xs border-border hover:bg-background"
      >
        <FileJson className="w-4 h-4" />
        {loading === 'json' ? 'Exporting...' : 'JSON'}
      </Button>
    </div>
  )
}
