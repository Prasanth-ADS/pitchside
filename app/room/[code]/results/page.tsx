import { getRoomSnapshot } from '@/app/actions/rooms'
import { notFound } from 'next/navigation'
import { ResultsClient } from '@/components/room/results-client'

interface Props {
  params: Promise<{ code: string }>
}

export default async function ResultsPage({ params }: Props) {
  const { code } = await params
  const snapshot = await getRoomSnapshot(code.toUpperCase())
  if (!snapshot) notFound()

  return <ResultsClient snapshot={snapshot} roomCode={code.toUpperCase()} />
}
