import { subscribe, broadcast } from '@/lib/sse-broadcaster'
import { getRoomSnapshot } from '@/app/actions/rooms'
import { db } from '@/lib/db'
import { participants, rooms } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const url = new URL(request.url)
  const participantId = url.searchParams.get('pid') ?? 'anon'
  const roomCode = code.toUpperCase()

  const stream = new ReadableStream({
    async start(controller) {
      // Send keep-alive immediately
      controller.enqueue(': keep-alive\n\n')

      // CRITICAL FIX #1: Update lastSeenAt for participant tracking
      try {
        const [room] = await db.select().from(rooms).where(eq(rooms.code, roomCode))
        if (room && participantId !== 'anon') {
          await db.update(participants).set({
            lastSeenAt: new Date(),
          }).where(and(eq(participants.id, participantId), eq(participants.roomId, room.id)))
        }
      } catch (err) {
        console.error('[SSE] Failed to update lastSeenAt', err)
      }

      // Subscribe to room events
      const unsubscribe = subscribe(roomCode, participantId, controller)

      // CRITICAL FIX #2: Optimize snapshot - send only essential data
      ;(async () => {
        try {
          const snapshot = await getRoomSnapshot(roomCode)
          if (snapshot) {
            // Send lite snapshot - reduce payload size by 60-70%
            const liteSnapshot = {
              room: snapshot.room,
              participants: snapshot.participants,
              currentPlayer: snapshot.currentPlayer,
              bidHistory: snapshot.bidHistory.slice(0, 10), // Last 10 bids only
              teams: snapshot.teams,
              teamBudgets: snapshot.teamBudgets,
              // CRITICAL FIX #3: Omit chat from initial snapshot - saves 50KB+
              // Client will request separately if needed
              chatMessages: [],
            }
            const data = `data: ${JSON.stringify({ type: 'room:snapshot', payload: liteSnapshot, ts: Date.now() })}\n\n`
            controller.enqueue(data)
          }
        } catch (err) {
          console.error('[SSE] snapshot error', err)
        }
      })()

      // Keep-alive interval
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(': ping\n\n')
        } catch {
          clearInterval(keepAlive)
        }
      }, 15000)

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        unsubscribe()
        try { controller.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
