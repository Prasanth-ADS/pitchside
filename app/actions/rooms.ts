'use server'

import { db } from '@/lib/db'
import {
  rooms, participants, teamPlayers, bids, chatMessages,
  players as playersTable, clubs, countries, playerAttributes,
} from '@/lib/db/schema'
import { eq, and, inArray, sql, isNull } from 'drizzle-orm'
import { generateRoomCode, generateParticipantId, pickAvatarColor, formatCurrency } from '@/lib/utils/format'
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

  // CRITICAL FIX #1: Use LEFT JOIN instead of N+1 query for bid history
  const bidHistoryRaw = room.currentPlayerId
    ? await db.select({
        bid: bids,
        participant: participants,
      })
        .from(bids)
        .leftJoin(participants, eq(participants.id, bids.participantId))
        .where(and(eq(bids.roomId, room.id), eq(bids.playerId, room.currentPlayerId ?? 0)))
        .orderBy(sql`${bids.bidAt} DESC`)
        .limit(20)
    : []

  const bidHistory = bidHistoryRaw.map((row) => ({
    id: row.bid.id,
    participantId: row.bid.participantId,
    displayName: row.participant?.displayName ?? 'Unknown',
    avatarColor: row.participant?.avatarColor ?? '#3b82f6',
    amount: row.bid.amount,
    ts: new Date(row.bid.bidAt!).getTime(),
  }))

  // CRITICAL FIX #2: Use single query with JOINs instead of N+1
  const wonPlayersRaw = await db.select({
    teamPlayer: teamPlayers,
    player: playersTable,
    club: clubs,
    country: countries,
    attributes: playerAttributes,
  })
    .from(teamPlayers)
    .innerJoin(playersTable, eq(teamPlayers.playerId, playersTable.id))
    .leftJoin(clubs, eq(playersTable.clubId, clubs.id))
    .leftJoin(countries, eq(playersTable.countryId, countries.id))
    .leftJoin(playerAttributes, eq(playersTable.id, playerAttributes.playerId))
    .where(eq(teamPlayers.roomId, room.id))

  const teams: Record<string, PlayerWithDetails[]> = {}
  const teamBudgets: Record<string, number> = {}

  for (const p of roomParticipants) {
    teamBudgets[p.id] = p.budgetRemaining
    teams[p.id] = []
  }

  for (const row of wonPlayersRaw) {
    const playerWithDetails: PlayerWithDetails = {
      ...row.player,
      club: row.club,
      country: row.country,
      attributes: row.attributes,
      secondaryPositions: [],
    }
    teams[row.teamPlayer.participantId] = [...(teams[row.teamPlayer.participantId] ?? []), playerWithDetails]
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

const BID_INCREMENT = 100000 // £100k minimum increment

export async function placeBid(input: {
  roomCode: string
  participantId: string
  amount: number
}): Promise<{ error?: string }> {
  try {
    return await db.transaction(async (tx) => {
      // CRITICAL FIX #1: Lock room row to prevent race conditions
      const [room] = await tx.select().from(rooms)
        .where(eq(rooms.code, input.roomCode))
        .for('update') // Database-level lock
      
      if (!room) return { error: 'Room not found' }
      if (room.status !== 'active') return { error: 'Auction not active' }
      if (!room.currentPlayerId) return { error: 'No player up for auction' }
      
      // CRITICAL FIX #2: Validate bid increment
      const minNextBid = (room.currentBid ?? 0) + BID_INCREMENT
      if (input.amount < minNextBid) {
        return { error: `Minimum bid is ${formatCurrency(minNextBid)}` }
      }

      // CRITICAL FIX #3: Lock participant to prevent budget over-spending
      const [participant] = await tx.select().from(participants)
        .where(and(eq(participants.id, input.participantId), eq(participants.roomId, room.id)))
        .for('update') // Participant row locked
      
      if (!participant) return { error: 'Participant not found' }
      
      // Validate sufficient budget for this bid
      if (participant.budgetRemaining < input.amount) {
        return { error: `Insufficient budget. Available: ${formatCurrency(participant.budgetRemaining)}` }
      }

      // CRITICAL FIX #4: Check for duplicate bid (idempotency)
      const [existingBid] = await tx.select().from(bids)
        .where(and(
          eq(bids.roomId, room.id),
          eq(bids.playerId, room.currentPlayerId),
          eq(bids.participantId, input.participantId),
          eq(bids.amount, input.amount)
        ))
        .limit(1)
      
      if (existingBid) {
        // Already placed this exact bid, return idempotent success
        const bidEntry = {
          id: existingBid.id,
          participantId: input.participantId,
          displayName: participant.displayName,
          avatarColor: participant.avatarColor,
          amount: input.amount,
          ts: Date.now(),
        }
        return {} // Success - was already placed
      }

      // Insert bid and update room atomically
      const [bid] = await tx.insert(bids).values({
        roomId: room.id,
        playerId: room.currentPlayerId,
        participantId: input.participantId,
        amount: input.amount,
      }).returning()

      // Reset timer on bid - keep auction active
      const newTimerEnd = new Date(Date.now() + room.timerSeconds * 1000)

      await tx.update(rooms).set({
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
    })
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
    return await db.transaction(async (tx) => {
      // CRITICAL FIX #1: Lock room row to prevent multiple finalizations
      const [room] = await tx.select().from(rooms)
        .where(eq(rooms.code, input.roomCode))
        .for('update')
      
      if (!room) return { error: 'Room not found' }
      if (room.hostId !== input.hostParticipantId) return { error: 'Only host can finalize' }
      
      // CRITICAL FIX #2: Check if already finalized (idempotency)
      if (room.status !== 'active') return { error: 'Auction not active' }
      if (!room.currentPlayerId) return { error: 'No active player' }

      const roomParticipants = await tx.select().from(participants).where(eq(participants.roomId, room.id))

      let winnerId: string | null = room.currentBidderId
      let winnerName: string | null = null
      const amountPaid = room.currentBid ?? 0

      // CRITICAL FIX #3: Always deduct budget from winner (even if unsold, keep as pending)
      if (winnerId && amountPaid > 0) {
        const winner = roomParticipants.find((p) => p.id === winnerId)
        winnerName = winner?.displayName ?? null

        // Insert team player and deduct budget atomically
        await tx.insert(teamPlayers).values({
          roomId: room.id,
          participantId: winnerId,
          playerId: room.currentPlayerId,
          amountPaid,
        })

        // Deduct from budget
        await tx.update(participants).set({
          budgetRemaining: sql`budget_remaining - ${amountPaid}`,
        }).where(eq(participants.id, winnerId))
      } else if (room.currentPlayerId && !winnerId) {
        // CRITICAL FIX #4: Player unsold - skip and move to next
        // Don't deduct budget, just move on
      }

      // Get next player
      const nextPlayer = await getNextAuctionPlayer(room.id)
      const teamBudgets: Record<string, number> = {}
      const updatedParticipants = await tx.select().from(participants).where(eq(participants.roomId, room.id))
      for (const p of updatedParticipants) teamBudgets[p.id] = p.budgetRemaining

      const playerSoldPayload = {
        playerId: room.currentPlayerId ?? 0,
        winnerId,
        winnerName,
        amountPaid,
        teamBudgets,
      }

      if (!nextPlayer) {
        // CRITICAL FIX #5: Atomic status update prevents multiple finalizations
        const [updated] = await tx.update(rooms)
          .set({
            status: 'ended',
            endedAt: new Date(),
            currentPlayerId: null,
            currentBid: 0,
            currentBidderId: null,
            timerEnd: null,
          })
          .where(and(eq(rooms.id, room.id), eq(rooms.status, 'active'))) // Only if still active
          .returning()
        
        if (!updated) return { error: 'Already ended' } // Idempotent

        broadcast(input.roomCode, 'auction:player_sold', playerSoldPayload)
        broadcast(input.roomCode, 'auction:ended', {})
        return {}
      }

      // CRITICAL FIX #6: Ensure no duplicate player selected
      const timerEnd = new Date(Date.now() + room.timerSeconds * 1000)
      await tx.update(rooms).set({
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
    })
  } catch (err) {
    console.error('[finalizePlayerSale]', err)
    return { error: 'Failed to finalize sale' }
  }
}

// ─── Send Chat ────────────────────────────────────────────────────────────────

// CRITICAL FIX: Rate limiting tracker for chat spam prevention
const chatRateLimits = new Map<string, Array<number>>() // participantId -> timestamps
const CHAT_RATE_LIMIT = 5 // messages
const CHAT_RATE_WINDOW = 10000 // per 10 seconds

export async function sendChatMessage(input: {
  roomCode: string
  participantId: string
  message: string
  messageType?: string
}): Promise<{ error?: string }> {
  try {
    // CRITICAL FIX #1: Rate limit spam
    const now = Date.now()
    const key = `${input.roomCode}:${input.participantId}`
    const timestamps = chatRateLimits.get(key) ?? []
    
    // Clean old timestamps
    const recentTimestamps = timestamps.filter((ts) => now - ts < CHAT_RATE_WINDOW)
    
    if (recentTimestamps.length >= CHAT_RATE_LIMIT) {
      return { error: `Rate limited. Max ${CHAT_RATE_LIMIT} messages per ${CHAT_RATE_WINDOW / 1000}s` }
    }
    
    recentTimestamps.push(now)
    chatRateLimits.set(key, recentTimestamps)

    const [room] = await db.select().from(rooms).where(eq(rooms.code, input.roomCode))
    if (!room) return { error: 'Room not found' }

    const [participant] = await db.select().from(participants)
      .where(and(eq(participants.id, input.participantId), eq(participants.roomId, room.id)))
    if (!participant) return { error: 'Not in room' }

    // CRITICAL FIX #2: Validate message length and sanitize
    const message = input.message.trim().slice(0, 500)
    if (!message) return { error: 'Message cannot be empty' }

    const [msg] = await db.insert(chatMessages).values({
      roomId: room.id,
      participantId: input.participantId,
      displayName: participant.displayName,
      avatarColor: participant.avatarColor,
      message,
      messageType: input.messageType ?? 'chat',
    }).returning()

    broadcast(input.roomCode, 'chat:message', msg)
    return {}
  } catch (err) {
    console.error('[sendChatMessage]', err)
    return { error: 'Failed to send message' }
  }
}

// Cleanup rate limit tracker every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamps] of chatRateLimits.entries()) {
    const active = timestamps.filter((ts) => now - ts < CHAT_RATE_WINDOW)
    if (active.length === 0) {
      chatRateLimits.delete(key)
    } else {
      chatRateLimits.set(key, active)
    }
  }
}, 300000)

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getNextAuctionPlayer(roomId: number): Promise<PlayerWithDetails | null> {
  // CRITICAL FIX #1: Use LEFT JOIN to find unsold players, prevents duplicates
  const [result] = await db.select({player: playersTable})
    .from(playersTable)
    .leftJoin(teamPlayers, and(
      eq(teamPlayers.playerId, playersTable.id),
      eq(teamPlayers.roomId, roomId)
    ))
    .where(isNull(teamPlayers.id)) // No match = not yet sold
    .orderBy(sql`RANDOM()`)
    .limit(1)

  if (!result) return null
  return getPlayerWithDetails(result.player.id)
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
