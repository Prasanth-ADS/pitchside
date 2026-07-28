import { getRoomSnapshot } from '@/app/actions/rooms'
import { notFound } from 'next/navigation'
import { LobbyClient } from '@/components/room/lobby-client'

interface Props {
  params: Promise<{ code: string }>
}

export default async function LobbyPage({ params }: Props) {
  const { code } = await params
  const snapshot = await getRoomSnapshot(code.toUpperCase())
  if (!snapshot) notFound()

  return <LobbyClient initialSnapshot={snapshot} roomCode={code.toUpperCase()} />
}
