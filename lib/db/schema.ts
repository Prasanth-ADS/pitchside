import {
  pgTable,
  serial,
  text,
  integer,
  bigint,
  boolean,
  timestamp,
  char,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

// ─── Reference tables ────────────────────────────────────────────────────────

export const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  code: char('code', { length: 3 }).notNull().unique(),
  flagEmoji: text('flag_emoji'),
})

export const leagues = pgTable('leagues', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  countryId: integer('country_id'),
  tier: integer('tier').default(1),
})

export const clubs = pgTable('clubs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name'),
  leagueId: integer('league_id'),
  countryId: integer('country_id'),
})

// ─── Players ──────────────────────────────────────────────────────────────────

export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  height: integer('height'),
  weight: integer('weight'),
  preferredFoot: text('preferred_foot').default('right'),
  primaryPosition: text('primary_position').notNull(),
  // secondary_positions is a postgres TEXT[] — we read it as text
  overallRating: integer('overall_rating').notNull(),
  potential: integer('potential').notNull(),
  marketValue: bigint('market_value', { mode: 'number' }).default(0),
  clubId: integer('club_id'),
  countryId: integer('country_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const playerAttributes = pgTable('player_attributes', {
  playerId: integer('player_id').primaryKey(),
  pace: integer('pace').default(50),
  shooting: integer('shooting').default(50),
  passing: integer('passing').default(50),
  dribbling: integer('dribbling').default(50),
  defending: integer('defending').default(50),
  physical: integer('physical').default(50),
  vision: integer('vision').default(50),
  positioning: integer('positioning').default(50),
  crossing: integer('crossing').default(50),
  finishing: integer('finishing').default(50),
  heading: integer('heading').default(50),
  longShots: integer('long_shots').default(50),
  standingTackle: integer('standing_tackle').default(50),
  jumping: integer('jumping').default(50),
  strength: integer('strength').default(50),
  stamina: integer('stamina').default(50),
  acceleration: integer('acceleration').default(50),
  sprintSpeed: integer('sprint_speed').default(50),
  agility: integer('agility').default(50),
  reactions: integer('reactions').default(50),
})

// ─── Rooms ────────────────────────────────────────────────────────────────────

export const rooms = pgTable('rooms', {
  id: serial('id').primaryKey(),
  code: char('code', { length: 6 }).notNull().unique(),
  name: text('name').notNull(),
  hostId: text('host_id').notNull(),
  status: text('status').notNull().default('lobby'),
  budgetPerTeam: bigint('budget_per_team', { mode: 'number' }).notNull().default(100000000),
  maxPlayersPerTeam: integer('max_players_per_team').notNull().default(15),
  minPlayersPerTeam: integer('min_players_per_team').notNull().default(11),
  timerSeconds: integer('timer_seconds').notNull().default(60),
  formation: text('formation').default('4-3-3'),
  currentPlayerId: integer('current_player_id'),
  currentBid: bigint('current_bid', { mode: 'number' }).default(0),
  currentBidderId: text('current_bidder_id'),
  timerEnd: timestamp('timer_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  startedAt: timestamp('started_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
})

export const participants = pgTable('participants', {
  id: text('id').primaryKey(),
  roomId: integer('room_id').notNull(),
  displayName: text('display_name').notNull(),
  avatarColor: text('avatar_color').notNull().default('#3b82f6'),
  budgetRemaining: bigint('budget_remaining', { mode: 'number' }).notNull(),
  isHost: boolean('is_host').default(false),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow(),
})

export const bids = pgTable('bids', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull(),
  playerId: integer('player_id').notNull(),
  participantId: text('participant_id').notNull(),
  amount: bigint('amount', { mode: 'number' }).notNull(),
  bidAt: timestamp('bid_at', { withTimezone: true }).defaultNow(),
})

export const teamPlayers = pgTable('team_players', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull(),
  participantId: text('participant_id').notNull(),
  playerId: integer('player_id').notNull(),
  amountPaid: bigint('amount_paid', { mode: 'number' }).notNull(),
  acquiredAt: timestamp('acquired_at', { withTimezone: true }).defaultNow(),
})

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  roomId: integer('room_id').notNull(),
  participantId: text('participant_id').notNull(),
  displayName: text('display_name').notNull(),
  avatarColor: text('avatar_color').notNull().default('#3b82f6'),
  message: text('message').notNull(),
  messageType: text('message_type').notNull().default('chat'),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow(),
})

// ─── Types ───────────────────────────────────────────────────────────────────

export type Country = typeof countries.$inferSelect
export type League = typeof leagues.$inferSelect
export type Club = typeof clubs.$inferSelect
export type Player = typeof players.$inferSelect
export type PlayerAttributes = typeof playerAttributes.$inferSelect
export type Room = typeof rooms.$inferSelect
export type Participant = typeof participants.$inferSelect
export type Bid = typeof bids.$inferSelect
export type TeamPlayer = typeof teamPlayers.$inferSelect
export type ChatMessage = typeof chatMessages.$inferSelect

export type PlayerWithDetails = Player & {
  club?: Club | null
  country?: Country | null
  attributes?: PlayerAttributes | null
  secondaryPositions?: string[]
}

export type RoomWithDetails = Room & {
  participants: Participant[]
  currentPlayer?: PlayerWithDetails | null
}
