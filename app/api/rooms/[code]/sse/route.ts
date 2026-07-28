import { subscribe, broadcast } from '@/lib/sse-broadcaster'
import { getRoomSnapshot } from '@/app/actions/rooms'
import { db } from '@/lib/db'
import { participants } from '@/lib/db/schema'
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
    start(controller) {
      // Send keep-alive immediately
      controller.enqueue(': keep-alive\n\n')

      // Subscribe to room events
      const unsubscribe = subscribe(roomCode, participantId, controller)

      // Update last_seen and broadcast snapshot
      ;(async () => {
        try {
          const snapshot = await getRoomSnapshot(roomCode)
          if (snapshot) {
            const data = `data: ${JSON.stringify({ type: 'room:snapshot', payload: snapshot, ts: Date.now() })}\n\n`
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
