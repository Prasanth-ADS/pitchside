'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createRoom } from '@/app/actions/rooms'
import { formatCurrency } from '@/lib/utils/format'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
}

const BUDGET_PRESETS = [50_000_000, 100_000_000, 150_000_000, 200_000_000]
const TIMER_PRESETS = [30, 60, 90, 120]

export function CreateRoomDialog({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [hostName, setHostName] = useState('')
  const [roomName, setRoomName] = useState('')
  const [budget, setBudget] = useState(100_000_000)
  const [maxPlayers, setMaxPlayers] = useState(15)
  const [minPlayers, setMinPlayers] = useState(11)
  const [timer, setTimer] = useState(60)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hostName.trim()) { setError('Enter your name'); return }
    if (!roomName.trim()) { setError('Enter a room name'); return }
    setLoading(true)
    setError('')
    const result = await createRoom({
      hostName: hostName.trim(),
      roomName: roomName.trim(),
      budgetPerTeam: budget,
      maxPlayersPerTeam: maxPlayers,
      minPlayersPerTeam: minPlayers,
      timerSeconds: timer,
    })
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    // Persist identity in sessionStorage
    sessionStorage.setItem(`draftday_id_${result.roomCode}`, result.participantId)
    sessionStorage.setItem(`draftday_host_${result.roomCode}`, '1')
    router.push(`/room/${result.roomCode}/lobby`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-foreground">Create Auction Room</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your room settings. You can start the auction once everyone has joined.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="hostName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Name</Label>
              <Input
                id="hostName"
                placeholder="e.g. Alex"
                value={hostName}
                onChange={e => setHostName(e.target.value)}
                className="bg-background border-border"
                maxLength={24}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="roomName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room Name</Label>
              <Input
                id="roomName"
                placeholder="e.g. Friday Draft"
                value={roomName}
                onChange={e => setRoomName(e.target.value)}
                className="bg-background border-border"
                maxLength={32}
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Budget Per Team — <span className="text-primary">{formatCurrency(budget)}</span>
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {BUDGET_PRESETS.map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                    budget === b
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {formatCurrency(b)}
                </button>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Bid Timer — <span className="text-primary">{timer}s</span>
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {TIMER_PRESETS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimer(t)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                    timer === t
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          {/* Squad size */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Squad Size</Label>
              <Input
                type="number"
                min={5} max={30}
                value={maxPlayers}
                onChange={e => setMaxPlayers(Number(e.target.value))}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min Squad Size</Label>
              <Input
                type="number"
                min={5} max={maxPlayers}
                value={minPlayers}
                onChange={e => setMinPlayers(Number(e.target.value))}
                className="bg-background border-border"
              />
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-11"
          >
            {loading ? 'Creating Room...' : 'Create Room & Go to Lobby'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
