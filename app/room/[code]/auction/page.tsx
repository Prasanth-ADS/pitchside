import { getRoomSnapshot } from '@/app/actions/rooms'
import { notFound, redirect } from 'next/navigation'
import { AuctionClient } from '@/components/auction/auction-client'

interface Props {
  params: Promise<{ code: string }>
}

export default async function AuctionPage({ params }: Props) {
  const { code } = await params
  const snapshot = await getRoomSnapshot(code.toUpperCase())
  if (!snapshot) notFound()
  if (snapshot.room.status === 'lobby') redirect(`/room/${code}/lobby`)
  if (snapshot.room.status === 'ended') redirect(`/room/${code}/results`)

  return <AuctionClient initialSnapshot={snapshot} roomCode={code.toUpperCase()} />
}
