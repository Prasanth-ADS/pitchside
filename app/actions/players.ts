'use server'

import { db } from '@/lib/db'
import { players, clubs, countries, leagues, playerAttributes } from '@/lib/db/schema'
import { eq, ilike, gte, lte, and, desc, asc, or, sql } from 'drizzle-orm'
import type { PlayerWithDetails } from '@/lib/db/schema'

export interface PlayerFilters {
  search?: string
  position?: string
  minRating?: number
  maxRating?: number
  countryCode?: string
  clubId?: number
  leagueId?: number
  sortBy?: 'overall_rating' | 'market_value' | 'age' | 'name'
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export async function getPlayers(filters: PlayerFilters = {}): Promise<{
  players: PlayerWithDetails[]
  total: number
}> {
  const {
    search,
    position,
    minRating,
    maxRating,
    countryCode,
    clubId,
    leagueId,
    sortBy = 'overall_rating',
    sortDir = 'desc',
    page = 1,
    limit = 24,
  } = filters

  const conditions = []

  if (search) {
    conditions.push(ilike(players.name, `%${search}%`))
  }
  if (position && position !== 'ALL') {
    conditions.push(eq(players.primaryPosition, position))
  }
  if (minRating !== undefined) {
    conditions.push(gte(players.overallRating, minRating))
  }
  if (maxRating !== undefined) {
    conditions.push(lte(players.overallRating, maxRating))
  }
  if (clubId !== undefined) {
    conditions.push(eq(players.clubId, clubId))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const sortColumn =
    sortBy === 'market_value' ? players.marketValue :
    sortBy === 'age' ? players.age :
    sortBy === 'name' ? players.name :
    players.overallRating

  const orderFn = sortDir === 'asc' ? asc : desc

  const offset = (page - 1) * limit

  const [rows, countResult] = await Promise.all([
    db.select({
      player: players,
      club: clubs,
      country: countries,
      attributes: playerAttributes,
    })
    .from(players)
    .leftJoin(clubs, eq(players.clubId, clubs.id))
    .leftJoin(countries, eq(players.countryId, countries.id))
    .leftJoin(playerAttributes, eq(players.id, playerAttributes.playerId))
    .where(where)
    .orderBy(orderFn(sortColumn))
    .limit(limit)
    .offset(offset),

    db.select({ count: sql<number>`count(*)::int` })
    .from(players)
    .where(where),
  ])

  return {
    players: rows.map((row) => ({
      ...row.player,
      club: row.club,
      country: row.country,
      attributes: row.attributes,
      secondaryPositions: [],
    })),
    total: countResult[0]?.count ?? 0,
  }
}

export async function getPlayerById(id: number): Promise<PlayerWithDetails | null> {
  const rows = await db.select({
    player: players,
    club: clubs,
    country: countries,
    attributes: playerAttributes,
  })
  .from(players)
  .leftJoin(clubs, eq(players.clubId, clubs.id))
  .leftJoin(countries, eq(players.countryId, countries.id))
  .leftJoin(playerAttributes, eq(players.id, playerAttributes.playerId))
  .where(eq(players.id, id))
  .limit(1)

  if (!rows[0]) return null
  return {
    ...rows[0].player,
    club: rows[0].club,
    country: rows[0].country,
    attributes: rows[0].attributes,
    secondaryPositions: [],
  }
}

export async function getClubs() {
  return db.select({
    id: clubs.id,
    name: clubs.name,
    shortName: clubs.shortName,
    leagueId: clubs.leagueId,
    countryId: clubs.countryId,
  }).from(clubs).orderBy(asc(clubs.name))
}

export async function getLeagues() {
  return db.select().from(leagues).orderBy(asc(leagues.name))
}

export async function getCountries() {
  return db.select().from(countries).orderBy(asc(countries.name))
}

export async function getTopPlayers(limit = 10): Promise<PlayerWithDetails[]> {
  const rows = await db.select({
    player: players,
    club: clubs,
    country: countries,
    attributes: playerAttributes,
  })
  .from(players)
  .leftJoin(clubs, eq(players.clubId, clubs.id))
  .leftJoin(countries, eq(players.countryId, countries.id))
  .leftJoin(playerAttributes, eq(players.id, playerAttributes.playerId))
  .orderBy(desc(players.overallRating))
  .limit(limit)

  return rows.map((row) => ({
    ...row.player,
    club: row.club,
    country: row.country,
    attributes: row.attributes,
    secondaryPositions: [],
  }))
}
