'use client'

const FEATURES = [
  {
    title: 'Real-Time Bidding',
    description: 'Every bid appears instantly for all participants via Server-Sent Events. No page refreshes — pure live action.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: 'Broadcast Auction Screen',
    description: 'Cinematic auction display with player card, live timer, bid history, and participant budgets — like a real IPL auction.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" />
        <polyline points="17 2 12 7 7 2" />
      </svg>
    ),
  },
  {
    title: '185+ Real Players',
    description: 'Full database of players from Premier League, La Liga, Bundesliga, Serie A and more — with ratings, attributes and positions.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Live Chat',
    description: 'React to big bids and trash-talk your friends in the built-in auction room chat — system events included.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Budget Management',
    description: 'Each team starts with a configurable budget. Overspending is blocked — strategy matters.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: 'Squad Summary & Export',
    description: 'Post-auction squad view with formation, player cards, and budget breakdown for every team.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
]

export function LandingFeatures() {
  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-accent text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-5">
          Features
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground text-balance">
          Everything for a perfect
          <br />
          <span className="text-primary">draft night</span>
        </h2>
        <p className="mt-5 text-muted-foreground text-lg max-w-2xl mx-auto text-balance">
          Built for friends who take fantasy football seriously. No sign-ups, no subscriptions — just create a room and start bidding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl p-6 border border-border bg-card hover:border-primary/30 transition-colors duration-200"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 text-primary border border-primary/20 bg-primary/10 group-hover:bg-primary/15 transition-colors">
              {f.icon}
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
