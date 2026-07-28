import { getPlayers, getClubs } from '@/app/actions/players'
import { PlayersClient } from '@/components/players/players-client'

export const metadata = {
  title: 'Player Database — DraftDay',
  description: 'Browse 185+ football players with ratings, attributes, and club data.',
}

export default async function PlayersPage() {
  const [{ players, total }, clubs] = await Promise.all([
    getPlayers({ limit: 24, sortBy: 'overall_rating', sortDir: 'desc' }),
    getClubs(),
  ])

  return <PlayersClient initialPlayers={players} initialTotal={total} clubs={clubs} />
}
