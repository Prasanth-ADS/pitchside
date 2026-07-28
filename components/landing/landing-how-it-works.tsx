'use client'

const STEPS = [
  {
    step: '01',
    title: 'Create a Room',
    description: 'Set your budget, player limits, and auction timer. Share the 6-character code with your friends.',
  },
  {
    step: '02',
    title: 'Everyone Joins',
    description: 'Friends join with your room code and a display name — no sign-up required. Wait in the lobby until ready.',
  },
  {
    step: '03',
    title: 'Bid on Players',
    description: 'A random player appears on the broadcast screen. Bid higher than the current price before the timer runs out.',
  },
  {
    step: '04',
    title: 'Build Your Squad',
    description: 'Win players, manage your budget, and watch rival teams take shape. The auction ends when all slots are filled.',
  },
]

export function LandingHowItWorks() {
  return (
    <section
      className="py-24 px-6 md:px-12 border-y border-border"
      style={{ background: 'oklch(0.12 0.015 255)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-accent text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-5">
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance">
            Up and running in
            <span className="text-primary"> 60 seconds</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative">
              {/* Connector line (not last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[calc(100%_-_24px)] w-full h-px bg-border z-0" />
              )}
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl border border-primary/30 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-black text-primary">{s.step}</span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-border pt-12">
          {[
            { value: '185+', label: 'Players in Database' },
            { value: '8', label: 'Top Leagues' },
            { value: '26', label: 'Clubs Represented' },
            { value: '∞', label: 'Rooms, Free Forever' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-black text-primary mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
