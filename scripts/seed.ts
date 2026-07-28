import { db, pool } from '@/lib/db'
import {
  countries,
  leagues,
  clubs,
  players,
  playerAttributes,
} from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

interface PlayerSeed {
  name: string
  age: number
  height: number
  weight: number
  preferredFoot: 'left' | 'right'
  position: string
  overall: number
  potential: number
  marketValue: number
  country: string
  club: string
  attributes: {
    pace: number
    shooting: number
    passing: number
    dribbling: number
    defending: number
    physical: number
    vision: number
    positioning: number
    crossing: number
    finishing: number
    heading: number
    longShots: number
    standingTackle: number
    jumping: number
    strength: number
    stamina: number
    acceleration: number
    sprintSpeed: number
    agility: number
    reactions: number
  }
}

const countryData = [
  { name: 'Spain', code: 'ESP', flag: '🇪🇸' },
  { name: 'England', code: 'ENG', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'France', code: 'FRA', flag: '🇫🇷' },
  { name: 'Germany', code: 'DEU', flag: '🇩🇪' },
  { name: 'Italy', code: 'ITA', flag: '🇮🇹' },
  { name: 'Portugal', code: 'POR', flag: '🇵🇹' },
  { name: 'Netherlands', code: 'NLD', flag: '🇳🇱' },
  { name: 'Belgium', code: 'BEL', flag: '🇧🇪' },
  { name: 'Argentina', code: 'ARG', flag: '🇦🇷' },
  { name: 'Brazil', code: 'BRA', flag: '🇧🇷' },
  { name: 'Uruguay', code: 'URY', flag: '🇺🇾' },
  { name: 'Colombia', code: 'COL', flag: '🇨🇴' },
]

const leagueData = [
  { name: 'La Liga', country: 'Spain' },
  { name: 'Premier League', country: 'England' },
  { name: 'Ligue 1', country: 'France' },
  { name: 'Bundesliga', country: 'Germany' },
  { name: 'Serie A', country: 'Italy' },
]

const clubsData = [
  { name: 'Real Madrid', shortName: 'RMA', league: 'La Liga', country: 'Spain' },
  { name: 'FC Barcelona', shortName: 'FCB', league: 'La Liga', country: 'Spain' },
  { name: 'Atlético Madrid', shortName: 'ATM', league: 'La Liga', country: 'Spain' },
  { name: 'Manchester United', shortName: 'MUN', league: 'Premier League', country: 'England' },
  { name: 'Manchester City', shortName: 'MCI', league: 'Premier League', country: 'England' },
  { name: 'Liverpool FC', shortName: 'LIV', league: 'Premier League', country: 'England' },
  { name: 'Arsenal FC', shortName: 'ARS', league: 'Premier League', country: 'England' },
  { name: 'Chelsea FC', shortName: 'CHE', league: 'Premier League', country: 'England' },
  { name: 'Paris Saint-Germain', shortName: 'PSG', league: 'Ligue 1', country: 'France' },
  { name: 'Olympique Marseille', shortName: 'OM', league: 'Ligue 1', country: 'France' },
  { name: 'Bayern Munich', shortName: 'FCB', league: 'Bundesliga', country: 'Germany' },
  { name: 'Borussia Dortmund', shortName: 'BVB', league: 'Bundesliga', country: 'Germany' },
  { name: 'AC Milan', shortName: 'ACM', league: 'Serie A', country: 'Italy' },
  { name: 'Inter Milan', shortName: 'INT', league: 'Serie A', country: 'Italy' },
  { name: 'Juventus', shortName: 'JUV', league: 'Serie A', country: 'Italy' },
]

const playersData: PlayerSeed[] = [
  // Real Madrid Players
  {
    name: 'Jude Bellingham',
    age: 21,
    height: 186,
    weight: 84,
    preferredFoot: 'left',
    position: 'CM',
    overall: 89,
    potential: 95,
    marketValue: 160000000,
    country: 'England',
    club: 'Real Madrid',
    attributes: { pace: 85, shooting: 83, passing: 82, dribbling: 84, defending: 79, physical: 87, vision: 85, positioning: 84, crossing: 78, finishing: 82, heading: 84, longShots: 81, standingTackle: 76, jumping: 88, strength: 88, stamina: 83, acceleration: 87, sprintSpeed: 83, agility: 82, reactions: 86 },
  },
  {
    name: 'Vinícius Júnior',
    age: 24,
    height: 180,
    weight: 73,
    preferredFoot: 'left',
    position: 'LW',
    overall: 91,
    potential: 93,
    marketValue: 180000000,
    country: 'Brazil',
    club: 'Real Madrid',
    attributes: { pace: 96, shooting: 86, passing: 82, dribbling: 93, defending: 38, physical: 80, vision: 80, positioning: 85, crossing: 81, finishing: 84, heading: 62, longShots: 78, standingTackle: 30, jumping: 76, strength: 79, stamina: 88, acceleration: 97, sprintSpeed: 95, agility: 94, reactions: 89 },
  },
  {
    name: 'Toni Kroos',
    age: 34,
    height: 183,
    weight: 79,
    preferredFoot: 'right',
    position: 'CM',
    overall: 86,
    potential: 86,
    marketValue: 70000000,
    country: 'Germany',
    club: 'Real Madrid',
    attributes: { pace: 76, shooting: 80, passing: 91, dribbling: 86, defending: 72, physical: 78, vision: 91, positioning: 85, crossing: 80, finishing: 78, heading: 72, longShots: 82, standingTackle: 70, jumping: 68, strength: 75, stamina: 85, acceleration: 76, sprintSpeed: 76, agility: 84, reactions: 88 },
  },
  {
    name: 'Éder Militão',
    age: 26,
    height: 187,
    weight: 86,
    preferredFoot: 'right',
    position: 'CB',
    overall: 88,
    potential: 91,
    marketValue: 85000000,
    country: 'Brazil',
    club: 'Real Madrid',
    attributes: { pace: 85, shooting: 47, passing: 76, dribbling: 71, defending: 89, physical: 89, vision: 73, positioning: 88, crossing: 62, finishing: 38, heading: 87, longShots: 48, standingTackle: 90, jumping: 89, strength: 91, stamina: 86, acceleration: 85, sprintSpeed: 85, agility: 79, reactions: 87 },
  },

  // Manchester City Players
  {
    name: 'Erling Haaland',
    age: 24,
    height: 194,
    weight: 88,
    preferredFoot: 'left',
    position: 'ST',
    overall: 92,
    potential: 95,
    marketValue: 180000000,
    country: 'Norway',
    club: 'Manchester City',
    attributes: { pace: 89, shooting: 94, passing: 68, dribbling: 81, defending: 45, physical: 89, vision: 72, positioning: 93, crossing: 60, finishing: 95, heading: 88, longShots: 86, standingTackle: 36, jumping: 85, strength: 87, stamina: 84, acceleration: 91, sprintSpeed: 87, agility: 77, reactions: 85 },
  },
  {
    name: 'Rodri',
    age: 28,
    height: 191,
    weight: 82,
    preferredFoot: 'right',
    position: 'CM',
    overall: 91,
    potential: 92,
    marketValue: 90000000,
    country: 'Spain',
    club: 'Manchester City',
    attributes: { pace: 79, shooting: 76, passing: 90, dribbling: 87, defending: 86, physical: 86, vision: 91, positioning: 88, crossing: 80, finishing: 74, heading: 78, longShots: 79, standingTackle: 87, jumping: 81, strength: 87, stamina: 89, acceleration: 80, sprintSpeed: 78, agility: 85, reactions: 88 },
  },
  {
    name: 'Ederson',
    age: 30,
    height: 188,
    weight: 82,
    preferredFoot: 'right',
    position: 'GK',
    overall: 89,
    potential: 89,
    marketValue: 70000000,
    country: 'Brazil',
    club: 'Manchester City',
    attributes: { pace: 76, shooting: 65, passing: 91, dribbling: 85, defending: 88, physical: 80, vision: 90, positioning: 88, crossing: 70, finishing: 42, heading: 73, longShots: 65, standingTackle: 36, jumping: 82, strength: 76, stamina: 88, acceleration: 75, sprintSpeed: 76, agility: 78, reactions: 89 },
  },

  // Liverpool Players
  {
    name: 'Mohamed Salah',
    age: 32,
    height: 175,
    weight: 71,
    preferredFoot: 'left',
    position: 'RW',
    overall: 89,
    potential: 89,
    marketValue: 100000000,
    country: 'Egypt',
    club: 'Liverpool FC',
    attributes: { pace: 89, shooting: 87, passing: 81, dribbling: 90, defending: 45, physical: 75, vision: 82, positioning: 89, crossing: 76, finishing: 88, heading: 71, longShots: 84, standingTackle: 38, jumping: 72, strength: 76, stamina: 89, acceleration: 92, sprintSpeed: 87, agility: 90, reactions: 88 },
  },
  {
    name: 'Alisson Ramses Becker',
    age: 31,
    height: 191,
    weight: 91,
    preferredFoot: 'right',
    position: 'GK',
    overall: 89,
    potential: 89,
    marketValue: 65000000,
    country: 'Brazil',
    club: 'Liverpool FC',
    attributes: { pace: 84, shooting: 68, passing: 86, dribbling: 80, defending: 85, physical: 85, vision: 88, positioning: 87, crossing: 70, finishing: 42, heading: 71, longShots: 68, standingTackle: 35, jumping: 84, strength: 88, stamina: 86, acceleration: 84, sprintSpeed: 84, agility: 79, reactions: 89 },
  },

  // Paris Saint-Germain Players
  {
    name: 'Kylian Mbappé',
    age: 25,
    height: 178,
    weight: 77,
    preferredFoot: 'right',
    position: 'ST',
    overall: 91,
    potential: 94,
    marketValue: 200000000,
    country: 'France',
    club: 'Paris Saint-Germain',
    attributes: { pace: 97, shooting: 89, passing: 79, dribbling: 92, defending: 45, physical: 78, vision: 78, positioning: 90, crossing: 71, finishing: 90, heading: 75, longShots: 82, standingTackle: 38, jumping: 78, strength: 78, stamina: 87, acceleration: 98, sprintSpeed: 96, agility: 93, reactions: 91 },
  },
  {
    name: 'Neymar Jr',
    age: 32,
    height: 177,
    weight: 68,
    preferredFoot: 'right',
    position: 'LW',
    overall: 85,
    potential: 85,
    marketValue: 70000000,
    country: 'Brazil',
    club: 'Paris Saint-Germain',
    attributes: { pace: 87, shooting: 84, passing: 86, dribbling: 92, defending: 37, physical: 63, vision: 88, positioning: 81, crossing: 79, finishing: 85, heading: 62, longShots: 80, standingTackle: 30, jumping: 70, strength: 64, stamina: 79, acceleration: 90, sprintSpeed: 86, agility: 94, reactions: 86 },
  },

  // Bayern Munich Players
  {
    name: 'Robert Lewandowski',
    age: 35,
    height: 186,
    weight: 81,
    preferredFoot: 'right',
    position: 'ST',
    overall: 89,
    potential: 89,
    marketValue: 50000000,
    country: 'Poland',
    club: 'Bayern Munich',
    attributes: { pace: 78, shooting: 92, passing: 79, dribbling: 87, defending: 41, physical: 84, vision: 79, positioning: 91, crossing: 73, finishing: 94, heading: 89, longShots: 81, standingTackle: 38, jumping: 84, strength: 84, stamina: 82, acceleration: 79, sprintSpeed: 78, agility: 84, reactions: 88 },
  },

  // Arsenal Players
  {
    name: 'Bukayo Saka',
    age: 23,
    height: 178,
    weight: 74,
    preferredFoot: 'left',
    position: 'LW',
    overall: 87,
    potential: 93,
    marketValue: 120000000,
    country: 'England',
    club: 'Arsenal FC',
    attributes: { pace: 88, shooting: 81, passing: 82, dribbling: 86, defending: 50, physical: 75, vision: 81, positioning: 83, crossing: 83, finishing: 80, heading: 68, longShots: 78, standingTackle: 45, jumping: 74, strength: 75, stamina: 87, acceleration: 89, sprintSpeed: 87, agility: 87, reactions: 85 },
  },
  {
    name: 'Declan Rice',
    age: 25,
    height: 193,
    weight: 88,
    preferredFoot: 'right',
    position: 'CM',
    overall: 87,
    potential: 92,
    marketValue: 110000000,
    country: 'England',
    club: 'Arsenal FC',
    attributes: { pace: 79, shooting: 71, passing: 83, dribbling: 77, defending: 88, physical: 89, vision: 82, positioning: 85, crossing: 76, finishing: 66, heading: 81, longShots: 74, standingTackle: 89, jumping: 82, strength: 90, stamina: 88, acceleration: 80, sprintSpeed: 79, agility: 76, reactions: 86 },
  },

  // Chelsea Players
  {
    name: 'Moisés Caicedo',
    age: 22,
    height: 188,
    weight: 82,
    preferredFoot: 'right',
    position: 'CM',
    overall: 85,
    potential: 94,
    marketValue: 115000000,
    country: 'Ecuador',
    club: 'Chelsea FC',
    attributes: { pace: 82, shooting: 75, passing: 84, dribbling: 82, defending: 85, physical: 87, vision: 84, positioning: 82, crossing: 75, finishing: 70, heading: 79, longShots: 76, standingTackle: 86, jumping: 83, strength: 88, stamina: 86, acceleration: 83, sprintSpeed: 81, agility: 81, reactions: 85 },
  },

  // Inter Milan Players
  {
    name: 'Lautaro Martínez',
    age: 26,
    height: 177,
    weight: 72,
    preferredFoot: 'right',
    position: 'ST',
    overall: 88,
    potential: 91,
    marketValue: 95000000,
    country: 'Argentina',
    club: 'Inter Milan',
    attributes: { pace: 84, shooting: 88, passing: 78, dribbling: 85, defending: 42, physical: 82, vision: 77, positioning: 89, crossing: 71, finishing: 89, heading: 84, longShots: 80, standingTackle: 37, jumping: 81, strength: 84, stamina: 86, acceleration: 85, sprintSpeed: 83, agility: 86, reactions: 86 },
  },

  // Barcelona Players
  {
    name: 'Robert Lewandowski',
    age: 36,
    height: 186,
    weight: 81,
    preferredFoot: 'right',
    position: 'ST',
    overall: 86,
    potential: 86,
    marketValue: 45000000,
    country: 'Poland',
    club: 'FC Barcelona',
    attributes: { pace: 74, shooting: 90, passing: 77, dribbling: 85, defending: 40, physical: 82, vision: 78, positioning: 90, crossing: 72, finishing: 92, heading: 88, longShots: 80, standingTackle: 36, jumping: 83, strength: 82, stamina: 80, acceleration: 75, sprintSpeed: 74, agility: 82, reactions: 86 },
  },
  {
    name: 'Gavi',
    age: 20,
    height: 173,
    weight: 67,
    preferredFoot: 'left',
    position: 'CM',
    overall: 85,
    potential: 95,
    marketValue: 80000000,
    country: 'Spain',
    club: 'FC Barcelona',
    attributes: { pace: 81, shooting: 75, passing: 85, dribbling: 88, defending: 72, physical: 70, vision: 86, positioning: 81, crossing: 79, finishing: 72, heading: 67, longShots: 76, standingTackle: 70, jumping: 72, strength: 68, stamina: 87, acceleration: 83, sprintSpeed: 80, agility: 89, reactions: 84 },
  },

  // Additional high-value players
  {
    name: 'Florian Wirtz',
    age: 21,
    height: 181,
    weight: 75,
    preferredFoot: 'left',
    position: 'LW',
    overall: 88,
    potential: 96,
    marketValue: 140000000,
    country: 'Germany',
    club: 'Borussia Dortmund',
    attributes: { pace: 88, shooting: 84, passing: 84, dribbling: 91, defending: 42, physical: 74, vision: 84, positioning: 84, crossing: 79, finishing: 84, heading: 68, longShots: 79, standingTackle: 38, jumping: 73, strength: 74, stamina: 88, acceleration: 89, sprintSpeed: 87, agility: 92, reactions: 87 },
  },
  {
    name: 'Pedri',
    age: 21,
    height: 174,
    weight: 65,
    preferredFoot: 'left',
    position: 'CM',
    overall: 86,
    potential: 95,
    marketValue: 100000000,
    country: 'Spain',
    club: 'FC Barcelona',
    attributes: { pace: 77, shooting: 74, passing: 87, dribbling: 88, defending: 70, physical: 65, vision: 88, positioning: 79, crossing: 79, finishing: 70, heading: 63, longShots: 76, standingTackle: 68, jumping: 68, strength: 63, stamina: 85, acceleration: 78, sprintSpeed: 76, agility: 88, reactions: 85 },
  },
  {
    name: 'Vinicius Jr',
    age: 24,
    height: 180,
    weight: 73,
    preferredFoot: 'left',
    position: 'LW',
    overall: 91,
    potential: 93,
    marketValue: 180000000,
    country: 'Brazil',
    club: 'Real Madrid',
    attributes: { pace: 96, shooting: 86, passing: 82, dribbling: 93, defending: 38, physical: 80, vision: 80, positioning: 85, crossing: 81, finishing: 84, heading: 62, longShots: 78, standingTackle: 30, jumping: 76, strength: 79, stamina: 88, acceleration: 97, sprintSpeed: 95, agility: 94, reactions: 89 },
  },
  {
    name: 'Aurélien Tchouaméni',
    age: 24,
    height: 188,
    weight: 85,
    preferredFoot: 'right',
    position: 'CM',
    overall: 85,
    potential: 92,
    marketValue: 90000000,
    country: 'France',
    club: 'Real Madrid',
    attributes: { pace: 81, shooting: 76, passing: 81, dribbling: 79, defending: 83, physical: 87, vision: 80, positioning: 82, crossing: 76, finishing: 72, heading: 80, longShots: 75, standingTackle: 84, jumping: 81, strength: 88, stamina: 85, acceleration: 82, sprintSpeed: 80, agility: 78, reactions: 84 },
  },
  {
    name: 'Phil Foden',
    age: 24,
    height: 182,
    weight: 74,
    preferredFoot: 'left',
    position: 'LW',
    overall: 88,
    potential: 94,
    marketValue: 130000000,
    country: 'England',
    club: 'Manchester City',
    attributes: { pace: 85, shooting: 86, passing: 85, dribbling: 92, defending: 48, physical: 76, vision: 86, positioning: 85, crossing: 80, finishing: 86, heading: 71, longShots: 81, standingTackle: 42, jumping: 74, strength: 75, stamina: 85, acceleration: 86, sprintSpeed: 84, agility: 91, reactions: 87 },
  },
  {
    name: 'Harry Kane',
    age: 31,
    height: 188,
    weight: 89,
    preferredFoot: 'right',
    position: 'ST',
    overall: 87,
    potential: 87,
    marketValue: 75000000,
    country: 'England',
    club: 'Bayern Munich',
    attributes: { pace: 79, shooting: 90, passing: 82, dribbling: 86, defending: 42, physical: 85, vision: 83, positioning: 91, crossing: 75, finishing: 91, heading: 88, longShots: 82, standingTackle: 39, jumping: 84, strength: 86, stamina: 81, acceleration: 81, sprintSpeed: 79, agility: 84, reactions: 87 },
  },
  {
    name: 'Jude Bellingham',
    age: 21,
    height: 186,
    weight: 84,
    preferredFoot: 'left',
    position: 'CM',
    overall: 89,
    potential: 95,
    marketValue: 160000000,
    country: 'England',
    club: 'Real Madrid',
    attributes: { pace: 85, shooting: 83, passing: 82, dribbling: 84, defending: 79, physical: 87, vision: 85, positioning: 84, crossing: 78, finishing: 82, heading: 84, longShots: 81, standingTackle: 76, jumping: 88, strength: 88, stamina: 83, acceleration: 87, sprintSpeed: 83, agility: 82, reactions: 86 },
  },
]

async function seed() {
  try {
    console.log('🌱 Starting database seed...')

    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await db.delete(playerAttributes)
    await db.delete(players)
    await db.delete(clubs)
    await db.delete(leagues)
    await db.delete(countries)

    // Seed countries
    console.log('🌍 Seeding countries...')
    const countryMap: Record<string, number> = {}
    for (const country of countryData) {
      const result = await db
        .insert(countries)
        .values({
          name: country.name,
          code: country.code,
          flagEmoji: country.flag,
        })
        .returning()
      countryMap[country.name] = result[0].id
    }

    // Seed leagues
    console.log('🏆 Seeding leagues...')
    const leagueMap: Record<string, number> = {}
    for (const league of leagueData) {
      const countryId = countryMap[league.country]
      const result = await db
        .insert(leagues)
        .values({
          name: league.name,
          countryId,
          tier: 1,
        })
        .returning()
      leagueMap[league.name] = result[0].id
    }

    // Seed clubs
    console.log('⚽ Seeding clubs...')
    const clubMap: Record<string, number> = {}
    for (const club of clubsData) {
      const leagueId = leagueMap[club.league]
      const countryId = countryMap[club.country]
      const result = await db
        .insert(clubs)
        .values({
          name: club.name,
          shortName: club.shortName,
          leagueId,
          countryId,
        })
        .returning()
      clubMap[club.name] = result[0].id
    }

    // Seed players
    console.log('👥 Seeding players...')
    for (const player of playersData) {
      const clubId = clubMap[player.club]
      const countryId = countryMap[player.country]

      const playerResult = await db
        .insert(players)
        .values({
          name: player.name,
          age: player.age,
          height: player.height,
          weight: player.weight,
          preferredFoot: player.preferredFoot,
          primaryPosition: player.position,
          overallRating: player.overall,
          potential: player.potential,
          marketValue: player.marketValue,
          clubId,
          countryId,
        })
        .returning()

      const playerId = playerResult[0].id

      // Insert player attributes
      await db.insert(playerAttributes).values({
        playerId,
        pace: player.attributes.pace,
        shooting: player.attributes.shooting,
        passing: player.attributes.passing,
        dribbling: player.attributes.dribbling,
        defending: player.attributes.defending,
        physical: player.attributes.physical,
        vision: player.attributes.vision,
        positioning: player.attributes.positioning,
        crossing: player.attributes.crossing,
        finishing: player.attributes.finishing,
        heading: player.attributes.heading,
        longShots: player.attributes.longShots,
        standingTackle: player.attributes.standingTackle,
        jumping: player.attributes.jumping,
        strength: player.attributes.strength,
        stamina: player.attributes.stamina,
        acceleration: player.attributes.acceleration,
        sprintSpeed: player.attributes.sprintSpeed,
        agility: player.attributes.agility,
        reactions: player.attributes.reactions,
      })
    }

    console.log('✅ Database seed completed successfully!')
    console.log(`📊 Seeded ${playersData.length} players`)
    console.log(`🏢 Seeded ${Object.keys(clubMap).length} clubs`)
    console.log(`🏆 Seeded ${Object.keys(leagueMap).length} leagues`)
    console.log(`🌍 Seeded ${Object.keys(countryMap).length} countries`)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
