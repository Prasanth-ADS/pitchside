'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreateRoomDialog } from '@/components/room/create-room-dialog'
import { JoinRoomDialog } from '@/components/room/join-room-dialog'

export function LandingFooter() {
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  return (
    <>
      {/* CTA */}
      <section className="py-24 px-6 md:px-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance mb-5">
            Ready to start
            <span className="text-primary"> bidding?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            Create a room in seconds. No account needed.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => setCreateOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-10 h-12 gold-glow"
            >
              Create Auction Room
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setJoinOpen(true)}
              className="border-border text-foreground hover:bg-accent font-semibold text-base px-10 h-12"
            >
              Join with Code
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-12 py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground" />
                <path d="M12 2L14.5 7.5L20 8L16 12L17 18L12 15L7 18L8 12L4 8L9.5 7.5L12 2Z" fill="currentColor" className="text-primary-foreground" />
              </svg>
            </div>
            <span className="text-sm font-bold text-foreground">DraftDay</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built for football fans. Not affiliated with any league or club.
          </p>
        </div>
      </footer>

      <CreateRoomDialog open={createOpen} onOpenChange={setCreateOpen} />
      <JoinRoomDialog open={joinOpen} onOpenChange={setJoinOpen} />
    </>
  )
}
