'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { joinRoom } from '@/app/actions/rooms'

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  prefillCode?: string
}

export function JoinRoomDialog({ open, onOpenChange, prefillCode = '' }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [roomCode, setRoomCode] = useState(prefillCode)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim()) { setError('Enter your display name'); return }
    if (roomCode.trim().length !== 6) { setError('Room code must be 6 characters'); return }
    setLoading(true)
    setError('')

    const result = await joinRoom({
      roomCode: roomCode.trim().toUpperCase(),
      displayName: displayName.trim(),
    })
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }
    sessionStorage.setItem(`draftday_id_${result.roomCode}`, result.participantId)
    router.push(`/room/${result.roomCode}/lobby`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-foreground">Join Auction Room</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the 6-character room code shared by your host.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="joinCode" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Room Code</Label>
            <Input
              id="joinCode"
              placeholder="e.g. XK7P2Q"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              className="bg-background border-border font-mono text-lg tracking-widest text-center uppercase"
              maxLength={6}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="joinName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Name</Label>
            <Input
              id="joinName"
              placeholder="e.g. Jordan"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="bg-background border-border"
              maxLength={24}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-11"
          >
            {loading ? 'Joining...' : 'Join Room'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
