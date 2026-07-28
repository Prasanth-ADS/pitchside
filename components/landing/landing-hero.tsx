'use client'

import { useState } from 'react'
import { CreateRoomDialog } from '@/components/room/create-room-dialog'
import { JoinRoomDialog } from '@/components/room/join-room-dialog'
import { Button } from '@/components/ui/button'

const STAT_CARDS = [
  { label: 'Pace', value: 95, color: '#22c55e' },
  { label: 'Shooting', value: 92, color: '#ef4444' },
  { label: 'Passing', value: 88, color: '#3b82f6' },
  { label: 'Dribbling', value: 94, color: '#f59e0b' },
]

export function LandingHero() {
  const [createOpen, setCreateOpen] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)

  return (
    <>
      <header className="relative overflow-hidden min-h-screen flex flex-col">
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, oklch(0.82 0.18 85 / 10%) 0%, transparent 70%)',
          }}
        />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground" />
                <path d="M12 2L14.5 7.5L20 8L16 12L17 18L12 15L7 18L8 12L4 8L9.5 7.5L12 2Z" fill="currentColor" className="text-primary-foreground" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">DraftDay</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setJoinOpen(true)} className="text-muted-foreground hover:text-foreground">
              Join Room
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              Create Room
            </Button>
          </div>
        </nav>

        {/* Hero body */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center gap-16 py-20">

            {/* Left copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
                Live Auction Platform
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-none mb-6">
                The Ultimate
                <br />
                <span className="text-primary">Football</span>
                <br />
                Auction
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg mb-10">
                Host live player auctions with your friends. Real-time bidding,
                broadcast-style screens, squad building — everything you need for
                the perfect draft night.
              </p>
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                <Button
                  size="lg"
                  onClick={() => setCreateOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base px-8 h-12 gold-glow"
                >
                  Create Auction Room
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setJoinOpen(true)}
                  className="border-border text-foreground hover:bg-accent font-semibold text-base px-8 h-12"
                >
                  Join with Code
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                No account needed — just a name and a room code.
              </p>
            </div>

            {/* Right: player card mockup */}
            <div className="flex-shrink-0 w-72 relative">
              {/* Main card */}
              <div className="player-card-shine rounded-2xl overflow-hidden border border-primary/20 gold-glow"
                style={{ background: 'linear-gradient(145deg, oklch(0.16 0.02 255), oklch(0.12 0.015 255))' }}>
                {/* Top band */}
                <div className="px-5 pt-5 pb-3 flex items-start justify-between"
                  style={{ background: 'linear-gradient(135deg, oklch(0.82 0.18 85 / 20%), transparent)' }}>
                  <div>
                    <div className="text-5xl font-black text-primary leading-none">91</div>
                    <div className="text-xs font-bold text-primary/80 tracking-widest uppercase mt-1">ST</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Norway</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Man City</div>
                    <div className="mt-2 text-xs font-semibold text-primary/60">World Class</div>
                  </div>
                </div>

                {/* Player silhouette placeholder */}
                <div className="mx-auto flex items-center justify-center py-6"
                  style={{ background: 'radial-gradient(ellipse at center, oklch(0.82 0.18 85 / 8%), transparent 70%)' }}>
                  <svg width="100" height="120" viewBox="0 0 100 120" fill="none">
                    <ellipse cx="50" cy="28" rx="16" ry="16" fill="oklch(0.82 0.18 85 / 20%)" />
                    <path d="M25 120 Q30 75 50 65 Q70 75 75 120" fill="oklch(0.82 0.18 85 / 15%)" />
                    <path d="M35 65 Q25 90 20 120" stroke="oklch(0.82 0.18 85 / 25%)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M65 65 Q75 90 80 120" stroke="oklch(0.82 0.18 85 / 25%)" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="px-5 pb-2">
                  <div className="text-sm font-bold text-foreground truncate">Erling Haaland</div>
                  <div className="text-xs text-muted-foreground">Manchester City</div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-1 px-5 pb-5 mt-3">
                  {STAT_CARDS.map((stat) => (
                    <div key={stat.label} className="rounded-lg px-3 py-2"
                      style={{ background: 'oklch(1 0 0 / 4%)' }}>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                      <div className="text-base font-bold mt-0.5" style={{ color: stat.color }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bid badge floating */}
              <div className="absolute -bottom-4 -right-4 rounded-xl px-4 py-3 glass-strong border border-primary/30 gold-glow">
                <div className="text-xs text-muted-foreground">Current Bid</div>
                <div className="text-lg font-black text-primary">£52.5M</div>
              </div>

              {/* Timer badge */}
              <div className="absolute -top-4 -left-4 rounded-xl px-3 py-2 glass-strong border border-red-500/30">
                <div className="text-xs text-muted-foreground">Timer</div>
                <div className="text-base font-black text-red-400 timer-critical">0:08</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom marquee strip */}
        <div className="relative z-10 border-t border-border py-3 overflow-hidden">
          <div className="flex gap-8 whitespace-nowrap text-xs text-muted-foreground font-medium tracking-wider uppercase animate-none">
            {Array.from({ length: 3 }).flatMap(() => [
              'Real-time bidding', '·', '185+ players', '·', 'Live chat', '·',
              'Squad builder', '·', 'Export results', '·', 'No sign-up needed', '·',
            ]).map((item, i) => (
              <span key={i}>{item}</span>
            ))}
          </div>
        </div>
      </header>

      <CreateRoomDialog open={createOpen} onOpenChange={setCreateOpen} />
      <JoinRoomDialog open={joinOpen} onOpenChange={setJoinOpen} />
    </>
  )
}
