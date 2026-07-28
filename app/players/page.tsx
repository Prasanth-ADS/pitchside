import { getPlayers, getClubs } from '@/app/actions/players'
import { PlayersClient } from '@/components/players/players-client'

export const metadata = {
  title: 'Player Database — DraftDay',
  description: 'Browse football players with ratings, attributes, and club data.',
}

// Mark this page as dynamic to avoid prerendering issues with database queries
export const dynamic = 'force-dynamic'

export default async function PlayersPage() {
  try {
    const [{ players, total }, clubs] = await Promise.all([
      getPlayers({ limit: 24, sortBy: 'overall_rating', sortDir: 'desc' }),
      getClubs(),
    ])
    return <PlayersClient initialPlayers={players} initialTotal={total} clubs={clubs} />
  } catch (error) {
    console.error('[PlayersPage]', error)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-semibold mb-2">Unable to load players</p>
          <p className="text-sm">Please ensure the database is seeded and connected.</p>
        </div>
      </div>
    )
  }
}
