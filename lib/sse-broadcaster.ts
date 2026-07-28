/**
 * In-memory SSE broadcaster.
 * Keyed by room code. Each subscriber gets pushed every event for that room.
 * Lives in the Node.js module cache — single instance per server process.
 */

export type SSEEventType =
  | 'room:snapshot'
  | 'bid:placed'
  | 'auction:next_player'
  | 'auction:player_sold'
  | 'auction:timer_update'
  | 'auction:ended'
  | 'chat:message'
  | 'participant:joined'
  | 'participant:left'
  | 'room:started'

export interface SSEEvent {
  type: SSEEventType
  payload: unknown
  ts: number
}

type Subscriber = {
  participantId: string
  controller: ReadableStreamDefaultController
}

const rooms = new Map<string, Set<Subscriber>>()

export function subscribe(roomCode: string, participantId: string, controller: ReadableStreamDefaultController) {
  if (!rooms.has(roomCode)) rooms.set(roomCode, new Set())
  const sub: Subscriber = { participantId, controller }
  rooms.get(roomCode)!.add(sub)
  return () => {
    rooms.get(roomCode)?.delete(sub)
    if (rooms.get(roomCode)?.size === 0) rooms.delete(roomCode)
  }
}

export function broadcast(roomCode: string, event: SSEEventType, payload: unknown) {
  const subs = rooms.get(roomCode)
  if (!subs || subs.size === 0) return
  const data = formatSSE({ type: event, payload, ts: Date.now() })
  const dead: Subscriber[] = []
  for (const sub of subs) {
    try {
      sub.controller.enqueue(data)
    } catch {
      dead.push(sub)
    }
  }
  dead.forEach((s) => subs.delete(s))
}

export function broadcastToOthers(
  roomCode: string,
  excludeParticipantId: string,
  event: SSEEventType,
  payload: unknown
) {
  const subs = rooms.get(roomCode)
  if (!subs || subs.size === 0) return
  const data = formatSSE({ type: event, payload, ts: Date.now() })
  const dead: Subscriber[] = []
  for (const sub of subs) {
    if (sub.participantId === excludeParticipantId) continue
    try {
      sub.controller.enqueue(data)
    } catch {
      dead.push(sub)
    }
  }
  dead.forEach((s) => subs.delete(s))
}

export function getRoomSubscriberCount(roomCode: string): number {
  return rooms.get(roomCode)?.size ?? 0
}

function formatSSE(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}
