'use server'

import { db } from '@/lib/db'
import {
  rooms, participants, teamPlayers, bids, chatMessages,
  players as playersTable, clubs, countries, playerAttributes,
} from '@/lib/db/schema'
import { eq, and, inArray, sql } from 'drizzle-orm'
import { generateRoomCode, generateParticipantId, pickAvatarColor } from '@/lib/utils/format'
import { broadcast } from '@/lib/sse-broadcaster'
import type { PlayerWithDetails } from '@/lib/db/schema'

// ─── Create Room ──────────────────────────────────────────────────────────────

export async function createRoom(input: {
  hostName: string
  roomName: string
  budgetPerTeam: number
  maxPlayersPerTeam: number
  minPlayersPerTeam: number
  timerSeconds: number
}): Promise<{ roomCode: string; participantId: string; error?: string }> {
  try {
    const code = generateRoomCode()
    const hostId = generateParticipantId()

    const [room] = await db.insert(rooms).values({
      code,
      name: input.roomName,
      hostId,
      status: 'lobby',
      budgetPerTeam: input.budgetPerTeam,
      maxPlayersPerTeam: input.maxPlayersPerTeam,
      minPlayersPerTeam: input.minPlayersPerTeam,
      timerSeconds: input.timerSeconds,
    }).returning()

    await db.insert(participants).values({
      id: hostId,
      roomId: room.id,
      displayName: input.hostName,
      avatarColor: pickAvatarColor(0),
      budgetRemaining: input.budgetPerTeam,
      isHost: true,
    })

    return { roomCode: code, participantId: hostId }
  } catch (err) {
    console.error('[createRoom]', err)
    return { roomCode: '', participantId: '', error: 'Failed to create room' }
  }
}

// ─── Join Room ────────────────────────────────────────────────────────────────

export async function joinRoom(input: {
  roomCode: string
  displayName: string
}): Promise<{ participantId: string; roomCode: string; error?: string }> {
  try {
    const [room] = await db.select().from(rooms).where(eq(rooms.code, input.roomCode.toUpperCase()))
    if (!room) return { participantId: '', roomCode: '', error: 'Room not found' }
    if (room.status !== 'lobby') return { participantId: '', roomCode: '', error: 'Auction already started' }

    const existingParticipants = await db.select().from(participants).where(eq(participants.roomId, room.id))
    const participantId = generateParticipantId()
    const color = pickAvatarColor(existingParticipants.length)

    await db.insert(participants).values({
      id: participantId,
      roomId: room.id,
      displayName: input.displayName,
      avatarColor: color,
      budgetRemaining: room.budgetPerTeam,
      isHost: false,
    })

    const newParticipant = { id: participantId, roomId: room.id, displayName: input.displayName, avatarColor: color, budgetRemaining: room.budgetPerTeam, isHost: false, joinedAt: new Date(), lastSeenAt: new Date() }
    broadcast(room.code, 'participant:joined', newParticipant)

    return { participantId, roomCode: room.code }
  } catch (err) {
    console.error('[joinRoom]', err)
    return { participantId: '', roomCode: '', error: 'Failed to join room' }
  }
}

// ─── Get Room Snapshot ────────────────────────────────────────────────────────

export async function getRoomSnapshot(roomCode: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.code, roomCode))
  if (!room) return null

  const roomParticipants = await db.select().from(participants).where(eq(participants.roomId, room.id))

  let currentPlayer: PlayerWithDetails | null = null
  if (room.currentPlayerId) {
    currentPlayer = await getPlayerWithDetails(room.currentPlayerId)
  }

  // Bids for current player
  const recentBids = room.currentPlayerId
    ? await db.select().from(bids)
        .where(and(eq(bids.roomId, room.id), eq(bids.playerId, room.currentPlayerId ?? 0)))
        .orderBy(sql`${bids.bidAt} DESC`)
        .limit(20)
    : []

  const bidHistory = recentBids.map((b) => {
    const p = roomParticipants.find((x) => x.id === b.participantId)
    return {
      id: b.id,
      participantId: b.participantId,
      displayName: p?.displayName ?? 'Unknown',
      avatarColor: p?.avatarColor ?? '#3b82f6',
      amount: b.amount,
      ts: new Date(b.bidAt!).getTime(),
    }
  })

  // Teams
  const wonPlayers = await db.select().from(teamPlayers).where(eq(teamPlayers.roomId, room.id))
  const teams: Record<string, PlayerWithDetails[]> = {}
  const teamBudgets: Record<string, number> = {}

  for (const p of roomParticipants) {
    teamBudgets[p.id] = p.budgetRemaining
    teams[p.id] = []
  }

  if (wonPlayers.length > 0) {
    const playerIds = wonPlayers.map((wp) => wp.playerId)
    const playerList = await Promise.all(playerIds.map(getPlayerWithDetails))
    for (const wp of wonPlayers) {
      const player = playerList.find((pl) => pl?.id === wp.playerId)
      if (player) {
        teams[wp.participantId] = [...(teams[wp.participantId] ?? []), player]
      }
    }
  }

  // Chat
  const msgs = await db.select().from(chatMessages)
    .where(eq(chatMessages.roomId, room.id))
    .orderBy(sql`${chatMessages.sentAt} ASC`)
    .limit(100)

  return {
    room,
    participants: roomParticipants,
    currentPlayer,
    bidHistory,
    teams,
    teamBudgets,
    chatMessages: msgs,
  }
}

// ─── Start Auction ────────────────────────────────────────────────────────────

export async function startAuction(roomCode: string, hostParticipantId: string): Promise<{ error?: string }> {
  try {
    const [room] = await db.select().from(rooms).where(eq(rooms.code, roomCode))
    if (!room) return { error: 'Room not found' }
    if (room.hostId !== hostParticipantId) return { error: 'Only the host can start' }
    if (room.status !== 'lobby') return { error: 'Already started' }

    const roomParticipants = await db.select().from(participants).where(eq(participants.roomId, room.id))
    if (roomParticipants.length < 1) return { error: 'Need at least 1 participant' }

    const nextPlayer = await getNextAuctionPlayer(room.id)
    if (!nextPlayer) return { error: 'No players available to auction' }

    const timerEnd = new Date(Date.now() + room.timerSeconds * 1000)

    await db.update(rooms).set({
      status: 'active',
      startedAt: new Date(),
      currentPlayerId: nextPlayer.id,
      currentBid: 0,
      currentBidderId: null,
      timerEnd,
    }).where(eq(rooms.id, room.id))

    broadcast(roomCode, 'room:started', { status: 'active', startedAt: new Date() })
    broadcast(roomCode, 'auction:next_player', {
      player: nextPlayer,
      roomUpdate: { status: 'active', currentPlayerId: nextPlayer.id, currentBid: 0, currentBidderId: null, timerEnd },
    })

    return {}
  } catch (err) {
    console.error('[startAuction]', err)
    return { error: 'Failed to start auction' }
  }
}

// ─── Place Bid ────────────────────────────────────────────────────────────────

export async function placeBid(input: {
  roomCode: string
  participantId: string
  amount: number
}): Promise<{ error?: string }> {
  try {
    const [room] = await db.select().from(rooms).where(eq(rooms.code, input.roomCode))
    if (!room) return { error: 'Room not found' }
    if (room.status !== 'active') return { error: 'Auction not active' }
    if (!room.currentPlayerId) return { error: 'No player up for auction' }
    if (input.amount <= (room.currentBid ?? 0)) return { error: 'Bid must be higher than current bid' }

    const [participant] = await db.select().from(participants)
      .where(and(eq(participants.id, input.participantId), eq(participants.roomId, room.id)))
    if (!participant) return { error: 'Participant not found' }
    if (participant.budgetRemaining < input.amount) return { error: 'Insufficient budget' }

    const [bid] = await db.insert(bids).values({
      roomId: room.id,
      playerId: room.currentPlayerId,
      participantId: input.participantId,
      amount: input.amount,
    }).returning()

    const newTimerEnd = new Date(Date.now() + room.timerSeconds * 1000)

    await db.update(rooms).set({
      currentBid: input.amount,
      currentBidderId: input.participantId,
      timerEnd: newTimerEnd,
    }).where(eq(rooms.id, room.id))

    const bidEntry = {
      id: bid.id,
      participantId: input.participantId,
      displayName: participant.displayName,
      avatarColor: participant.avatarColor,
      amount: input.amount,
      ts: Date.now(),
    }

    broadcast(input.roomCode, 'bid:placed', {
      bid: bidEntry,
      roomUpdate: { currentBid: input.amount, currentBidderId: input.participantId, timerEnd: newTimerEnd },
    })

    return {}
  } catch (err) {
    console.error('[placeBid]', err)
    return { error: 'Failed to place bid' }
  }
}

// ─── Sell Player (timer expired) ─────────────────────────────────────────────

export async function finalizePlayerSale(input: {
  roomCode: string
  hostParticipantId: string
}): Promise<{ error?: string }> {
  try {
    const [room] = await db.select().from(rooms).where(eq(rooms.code, input.roomCode))
    if (!room) return { error: 'Room not found' }
    if (room.hostId !== input.hostParticipantId) return { error: 'Only host can finalize' }
    if (room.status !== 'active') return { error: 'Not active' }

    const roomParticipants = await db.select().from(participants).where(eq(participants.roomId, room.id))

    let winnerId: string | null = room.currentBidderId
    let winnerName: string | null = null
    const amountPaid = room.currentBid ?? 0

    if (winnerId && amountPaid > 0 && room.currentPlayerId) {
      const winner = roomParticipants.find((p) => p.id === winnerId)
      winnerName = winner?.displayName ?? null

      await db.insert(teamPlayers).values({
        roomId: room.id,
        participantId: winnerId,
        playerId: room.currentPlayerId,
        amountPaid,
      })

      await db.update(participants).set({
        budgetRemaining: sql`budget_remaining - ${amountPaid}`,
      }).where(eq(participants.id, winnerId))
    }

    // Get next player
    const nextPlayer = await getNextAuctionPlayer(room.id)
    const teamBudgets: Record<string, number> = {}
    const updatedParticipants = await db.select().from(participants).where(eq(participants.roomId, room.id))
    for (const p of updatedParticipants) teamBudgets[p.id] = p.budgetRemaining

    const playerSoldPayload = {
      playerId: room.currentPlayerId ?? 0,
      winnerId,
      winnerName,
      amountPaid,
      teamBudgets,
    }

    if (!nextPlayer) {
      // Auction ended
      await db.update(rooms).set({ status: 'ended', endedAt: new Date(), currentPlayerId: null, currentBid: 0, currentBidderId: null, timerEnd: null }).where(eq(rooms.id, room.id))
      broadcast(input.roomCode, 'auction:player_sold', playerSoldPayload)
      broadcast(input.roomCode, 'auction:ended', {})
      return {}
    }

    const timerEnd = new Date(Date.now() + room.timerSeconds * 1000)
    await db.update(rooms).set({
      currentPlayerId: nextPlayer.id,
      currentBid: 0,
      currentBidderId: null,
      timerEnd,
    }).where(eq(rooms.id, room.id))

    broadcast(input.roomCode, 'auction:player_sold', playerSoldPayload)
    broadcast(input.roomCode, 'auction:next_player', {
      player: nextPlayer,
      roomUpdate: { currentPlayerId: nextPlayer.id, currentBid: 0, currentBidderId: null, timerEnd },
    })

    return {}
  } catch (err) {
    console.error('[finalizePlayerSale]', err)
    return { error: 'Failed to finalize sale' }
  }
}

// ─── Send Chat ────────────────────────────────────────────────────────────────

export async function sendChatMessage(input: {
  roomCode: string
  participantId: string
  message: string
  messageType?: string
}): Promise<{ error?: string }> {
  try {
    const [room] = await db.select().from(rooms).where(eq(rooms.code, input.roomCode))
    if (!room) return { error: 'Room not found' }

    const [participant] = await db.select().from(participants)
      .where(and(eq(participants.id, input.participantId), eq(participants.roomId, room.id)))
    if (!participant) return { error: 'Not in room' }

    const [msg] = await db.insert(chatMessages).values({
      roomId: room.id,
      participantId: input.participantId,
      displayName: participant.displayName,
      avatarColor: participant.avatarColor,
      message: input.message.slice(0, 500),
      messageType: input.messageType ?? 'chat',
    }).returning()

    broadcast(input.roomCode, 'chat:message', msg)
    return {}
  } catch (err) {
    console.error('[sendChatMessage]', err)
    return { error: 'Failed to send message' }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getNextAuctionPlayer(roomId: number): Promise<PlayerWithDetails | null> {
  const soldPlayerIds = await db.select({ playerId: teamPlayers.playerId })
    .from(teamPlayers).where(eq(teamPlayers.roomId, roomId))

  const soldIds = soldPlayerIds.map((x) => x.playerId)

  const queryBase = db.select().from(playersTable)
    .orderBy(sql`RANDOM()`)
    .limit(1)

  const result = soldIds.length > 0
    ? await queryBase.where(sql`${playersTable.id} NOT IN (${sql.join(soldIds.map(id => sql`${id}`), sql`, `)})`)
    : await queryBase

  if (!result[0]) return null
  return getPlayerWithDetails(result[0].id)
}

export async function getPlayerWithDetails(playerId: number): Promise<PlayerWithDetails | null> {
  const result = await db
    .select({
      player: playersTable,
      club: clubs,
      country: countries,
      attributes: playerAttributes,
    })
    .from(playersTable)
    .leftJoin(clubs, eq(playersTable.clubId, clubs.id))
    .leftJoin(countries, eq(playersTable.countryId, countries.id))
    .leftJoin(playerAttributes, eq(playersTable.id, playerAttributes.playerId))
    .where(eq(playersTable.id, playerId))
    .limit(1)

  if (!result[0]) return null
  const row = result[0]
  return {
    ...row.player,
    club: row.club,
    country: row.country,
    attributes: row.attributes,
    secondaryPositions: [],
  }
}

export async function getRoomParticipants(roomCode: string) {
  const [room] = await db.select().from(rooms).where(eq(rooms.code, roomCode))
  if (!room) return []
  return db.select().from(participants).where(eq(participants.roomId, room.id))
}
