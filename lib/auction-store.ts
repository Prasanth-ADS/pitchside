'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { PlayerWithDetails, Participant, ChatMessage, Room } from '@/lib/db/schema'

export interface BidEntry {
  id: number
  participantId: string
  displayName: string
  avatarColor: string
  amount: number
  ts: number
}

export interface AuctionState {
  // Identity
  myParticipantId: string | null
  myDisplayName: string | null
  myAvatarColor: string | null

  // Room
  room: Room | null
  participants: Participant[]

  // Current auction
  currentPlayer: PlayerWithDetails | null
  currentBid: number
  currentBidderId: string | null
  timerEnd: number | null // unix ms
  bidHistory: BidEntry[]

  // Team data: participantId -> player list
  teams: Record<string, PlayerWithDetails[]>
  teamBudgets: Record<string, number> // participantId -> remaining budget
  marketPlayers: PlayerWithDetails[]

  // Chat
  chatMessages: ChatMessage[]

  // SSE connection
  sseStatus: 'connecting' | 'connected' | 'disconnected'

  // Actions
  setIdentity: (id: string, name: string, color: string) => void
  applySnapshot: (snapshot: RoomSnapshot) => void
  applyBidPlaced: (bid: BidEntry, roomUpdate: Partial<Room>) => void
  applyNextPlayer: (player: PlayerWithDetails, roomUpdate: Partial<Room>, marketPlayers?: PlayerWithDetails[]) => void
  applyPlayerSold: (payload: PlayerSoldPayload) => void
  applyTimerUpdate: (timerEnd: number) => void
  applyAuctionEnded: () => void
  applyChat: (msg: ChatMessage) => void
  applyParticipantJoined: (participant: Participant) => void
  applyParticipantLeft: (participantId: string) => void
  applyRoomStarted: (roomUpdate: Partial<Room>) => void
  setSseStatus: (status: 'connecting' | 'connected' | 'disconnected') => void
  reset: () => void
}

export interface RoomSnapshot {
  room: Room
  participants: Participant[]
  currentPlayer: PlayerWithDetails | null
  bidHistory: BidEntry[]
  teams: Record<string, PlayerWithDetails[]>
  teamBudgets: Record<string, number>
  marketPlayers?: PlayerWithDetails[]
  chatMessages: ChatMessage[]
}

export interface PlayerSoldPayload {
  playerId: number
  winnerId: string | null
  winnerName: string | null
  amountPaid: number
  teamBudgets: Record<string, number>
}

const initialState = {
  myParticipantId: null,
  myDisplayName: null,
  myAvatarColor: null,
  room: null,
  participants: [],
  currentPlayer: null,
  currentBid: 0,
  currentBidderId: null,
  timerEnd: null,
  bidHistory: [],
  teams: {},
  teamBudgets: {},
  marketPlayers: [],
  chatMessages: [],
  sseStatus: 'disconnected' as const,
}

export const useAuctionStore = create<AuctionState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    setIdentity: (id, name, color) =>
      set({ myParticipantId: id, myDisplayName: name, myAvatarColor: color }),

    applySnapshot: (snapshot) =>
      set({
        room: snapshot.room,
        participants: snapshot.participants,
        currentPlayer: snapshot.currentPlayer,
        currentBid: snapshot.room.currentBid ?? 0,
        currentBidderId: snapshot.room.currentBidderId ?? null,
        timerEnd: snapshot.room.timerEnd ? new Date(snapshot.room.timerEnd as unknown as string).getTime() : null,
        bidHistory: snapshot.bidHistory,
        teams: snapshot.teams,
        teamBudgets: snapshot.teamBudgets,
        marketPlayers: snapshot.marketPlayers ?? [],
        chatMessages: snapshot.chatMessages,
      }),

    applyBidPlaced: (bid, roomUpdate) =>
      set((s) => ({
        bidHistory: [bid, ...s.bidHistory.filter((entry) => entry.id !== bid.id)].slice(0, 50),
        currentBid: bid.amount,
        currentBidderId: bid.participantId,
        timerEnd: roomUpdate.timerEnd
          ? new Date(roomUpdate.timerEnd as unknown as string).getTime()
          : s.timerEnd,
        room: s.room ? { ...s.room, ...roomUpdate } : s.room,
      })),

    applyNextPlayer: (player, roomUpdate, marketPlayers) =>
      set((s) => ({
        currentPlayer: player,
        currentBid: 0,
        currentBidderId: null,
        timerEnd: roomUpdate.timerEnd
          ? new Date(roomUpdate.timerEnd as unknown as string).getTime()
          : null,
        bidHistory: [],
        marketPlayers: marketPlayers ?? s.marketPlayers.filter((p) => p.id !== player.id),
        room: s.room ? { ...s.room, ...roomUpdate } : s.room,
      })),

    applyPlayerSold: (payload) =>
      set((s) => {
        const newTeams = { ...s.teams }
        if (payload.winnerId && s.currentPlayer) {
          newTeams[payload.winnerId] = [
            ...(newTeams[payload.winnerId] ?? []),
            s.currentPlayer,
          ]
        }
        return {
          teams: newTeams,
          teamBudgets: payload.teamBudgets,
          currentBid: 0,
          currentBidderId: null,
          bidHistory: [],
        }
      }),

    applyTimerUpdate: (timerEnd) => set({ timerEnd }),

    applyAuctionEnded: () =>
      set((s) => ({
        room: s.room ? { ...s.room, status: 'ended' } : s.room,
        currentPlayer: null,
        timerEnd: null,
      })),

    applyChat: (msg) =>
      set((s) => ({
        chatMessages: [...s.chatMessages.filter((entry) => entry.id !== msg.id), msg].slice(-200),
      })),

    applyParticipantJoined: (participant) =>
      set((s) => ({
        participants: [...s.participants.filter((p) => p.id !== participant.id), participant],
        teamBudgets: {
          ...s.teamBudgets,
          [participant.id]: participant.budgetRemaining,
        },
      })),

    applyParticipantLeft: (participantId) =>
      set((s) => ({
        participants: s.participants.filter((p) => p.id !== participantId),
      })),

    applyRoomStarted: (roomUpdate) =>
      set((s) => ({
        room: s.room ? { ...s.room, ...roomUpdate } : s.room,
      })),

    setSseStatus: (status) => set({ sseStatus: status }),

    reset: () => set(initialState),
  }))
)
