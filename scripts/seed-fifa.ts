import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { db } from '../lib/db/index.js'
import {
  countries,
  leagues,
  clubs,
  players,
  playerAttributes,
} from '../lib/db/schema.js'
import { eq } from 'drizzle-orm'

interface FIFAPlayerRow {
  name: string
  full_name: string
  birth_date: string
  age: string
  height_cm: string
  weight_kgs: string
  positions: string
  nationality: string
  overall_rating: string
  potential: string
  value_euro: string
  wage_euro: string
  preferred_foot: string
  international_reputation: string
  weak_foot: string
  skill_moves: string
  body_type: string
  release_clause_euro: string
  national_team: string
  national_rating: string
  national_team_position: string
  national_jersey_number: string
  crossing: string
  finishing: string
  heading_accuracy: string
  short_passing: string
  volleys: string
  dribbling: string
  curve: string
  freekick_accuracy: string
  long_passing: string
  ball_control: string
  acceleration: string
  sprint_speed: string
  agility: string
  reactions: string
  balance: string
  shot_power: string
  jumping: string
  stamina: string
  strength: string
  long_shots: string
  aggression: string
  interceptions: string
  positioning: string
  vision: string
  penalties: string
  composure: string
  marking: string
  standing_tackle: string
  sliding_tackle: string
}

// Country code mapping
const countryCodeMap: Record<string, string> = {
  'Argentina': 'ARG',
  'Brazil': 'BRA',
  'Germany': 'DEU',
  'Spain': 'ESP',
  'France': 'FRA',
  'England': 'ENG',
  'Italy': 'ITA',
  'Netherlands': 'NLD',
  'Belgium': 'BEL',
  'Portugal': 'POR',
  'Uruguay': 'URY',
  'Colombia': 'COL',
  'Poland': 'POL',
  'Mexico': 'MEX',
  'Japan': 'JPN',
  'South Korea': 'KOR',
  'Sweden': 'SWE',
  'Norway': 'NOR',
  'Denmark': 'DNK',
  'Switzerland': 'CHE',
  'Austria': 'AUT',
  'Czech Republic': 'CZE',
  'Greece': 'GRC',
  'Russia': 'RUS',
  'Turkey': 'TUR',
  'Ukraine': 'UKR',
  'Romania': 'ROU',
  'Serbia': 'SRB',
  'Croatia': 'HRV',
  'Egypt': 'EGY',
  'Algeria': 'DZA',
  'Cameroon': 'CMR',
  'Senegal': 'SEN',
  'Ghana': 'GHA',
  'Nigeria': 'NGA',
  'South Africa': 'ZAF',
  'Kenya': 'KEN',
  'Morocco': 'MAR',
}

// Country flag mapping
const countryFlagMap: Record<string, string> = {
  'Argentina': '🇦🇷',
  'Brazil': '🇧🇷',
  'Germany': '🇩🇪',
  'Spain': '🇪🇸',
  'France': '🇫🇷',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Italy': '🇮🇹',
  'Netherlands': '🇳🇱',
  'Belgium': '🇧🇪',
  'Portugal': '🇵🇹',
  'Uruguay': '🇺🇾',
  'Colombia': '🇨🇴',
  'Poland': '🇵🇱',
  'Mexico': '🇲🇽',
  'Japan': '🇯🇵',
  'South Korea': '🇰🇷',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Denmark': '🇩🇰',
  'Switzerland': '🇨🇭',
  'Austria': '🇦🇹',
  'Czech Republic': '🇨🇿',
  'Greece': '🇬🇷',
  'Russia': '🇷🇺',
  'Turkey': '🇹🇷',
  'Ukraine': '🇺🇦',
  'Romania': '🇷🇴',
  'Serbia': '🇷🇸',
  'Croatia': '🇭🇷',
  'Egypt': '🇪🇬',
  'Algeria': '🇩🇿',
  'Cameroon': '🇨🇲',
  'Senegal': '🇸🇳',
  'Ghana': '🇬🇭',
  'Nigeria': '🇳🇬',
  'South Africa': '🇿🇦',
  'Kenya': '🇰🇪',
  'Morocco': '🇲🇦',
}

// Known clubs mapping
const clubMap: Record<string, { league: string; country: string }> = {
  'Real Madrid': { league: 'La Liga', country: 'Spain' },
  'Barcelona': { league: 'La Liga', country: 'Spain' },
  'Atlético Madrid': { league: 'La Liga', country: 'Spain' },
  'Manchester United': { league: 'Premier League', country: 'England' },
  'Manchester City': { league: 'Premier League', country: 'England' },
  'Liverpool': { league: 'Premier League', country: 'England' },
  'Arsenal': { league: 'Premier League', country: 'England' },
  'Chelsea': { league: 'Premier League', country: 'England' },
  'Paris Saint-Germain': { league: 'Ligue 1', country: 'France' },
  'Bayern Munich': { league: 'Bundesliga', country: 'Germany' },
  'Borussia Dortmund': { league: 'Bundesliga', country: 'Germany' },
  'Juventus': { league: 'Serie A', country: 'Italy' },
  'AC Milan': { league: 'Serie A', country: 'Italy' },
  'Inter Milan': { league: 'Serie A', country: 'Italy' },
  'Ajax': { league: 'Eredivisie', country: 'Netherlands' },
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

function csvToObject(headers: string[], values: string[]): FIFAPlayerRow {
  const obj: any = {}
  headers.forEach((header, index) => {
    obj[header] = values[index] || ''
  })
  return obj
}

async function seedDatabase() {
  console.log('🌱 Starting FIFA player database seed...')
  console.log('📊 Connecting to database...')

  try {
    // 1. Clear existing data
    console.log('🧹 Clearing existing data...')
    await db.delete(playerAttributes)
    await db.delete(players)
    await db.delete(clubs)
    await db.delete(leagues)
    await db.delete(countries)

    // 2. Seed countries
    console.log('🌍 Seeding countries...')
    const countriesToInsert = Array.from(
      new Map(
        Object.entries(countryCodeMap).map(([name, code]) => [
          code,
          {
            name,
            code,
            flagEmoji: countryFlagMap[name] || '🚩',
          },
        ])
      ).values()
    )

    await db.insert(countries).values(countriesToInsert).onConflictDoNothing()

    // 3. Seed leagues
    console.log('🏆 Seeding leagues...')
    const leaguesMap = new Map<string, string>()
    const leaguesToInsert = [
      { name: 'La Liga', country: 'Spain', tier: 1 },
      { name: 'Premier League', country: 'England', tier: 1 },
      { name: 'Ligue 1', country: 'France', tier: 1 },
      { name: 'Bundesliga', country: 'Germany', tier: 1 },
      { name: 'Serie A', country: 'Italy', tier: 1 },
      { name: 'Eredivisie', country: 'Netherlands', tier: 1 },
      { name: 'Liga NOS', country: 'Portugal', tier: 1 },
      { name: 'Pro League', country: 'Belgium', tier: 1 },
    ]

    for (const league of leaguesToInsert) {
      const countryRecord = await db
        .select()
        .from(countries)
        .where(eq(countries.name, league.country))
        .limit(1)

      if (countryRecord.length > 0) {
        const inserted = await db
          .insert(leagues)
          .values({
            name: league.name,
            countryId: countryRecord[0].id,
            tier: league.tier,
          })
          .returning()

        if (inserted.length > 0) {
          leaguesMap.set(league.name, String(inserted[0].id))
        }
      }
    }

    // 4. Seed clubs
    console.log('⚽ Seeding clubs...')
    const clubsToInsert: any[] = []
    const processedClubs = new Set<string>()

    for (const [clubName, info] of Object.entries(clubMap)) {
      if (processedClubs.has(clubName)) continue
      processedClubs.add(clubName)

      const league = await db
        .select()
        .from(leagues)
        .where(eq(leagues.name, info.league))
        .limit(1)

      const country = await db
        .select()
        .from(countries)
        .where(eq(countries.name, info.country))
        .limit(1)

      if (league.length > 0 && country.length > 0) {
        clubsToInsert.push({
          name: clubName,
          shortName: clubName.substring(0, 3).toUpperCase(),
          leagueId: league[0].id,
          countryId: country[0].id,
        })
      }
    }

    await db.insert(clubs).values(clubsToInsert).onConflictDoNothing()

    // 5. Read and parse FIFA CSV
    console.log('📖 Reading FIFA players CSV...')
    const csvPath = path.join(process.cwd(), 'data', 'fifa_players.csv')
    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = fileContent.split('\n').filter((line) => line.trim())

    const headerLine = lines[0]
    const headers = parseCSVLine(headerLine)

    console.log(`📥 Parsing ${lines.length - 1} players from FIFA data...`)

    let playersInserted = 0
    let playersSkipped = 0
    const batchSize = 100

    // Process players in batches
    for (let i = 1; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, Math.min(i + batchSize, lines.length))
      const playerBatch = []
      const attributesBatch = []

      for (const line of batch) {
        if (!line.trim()) continue

        try {
          const values = parseCSVLine(line)
          const playerRow = csvToObject(headers, values)

          // Get or create country
          const playerCountry = await db
            .select()
            .from(countries)
            .where(eq(countries.name, playerRow.nationality))
            .limit(1)

          if (!playerCountry.length) {
            playersSkipped++
            continue
          }

          // Determine club
          let clubId: number | undefined
          if (playerRow.club && playerRow.club !== '') {
            const club = await db
              .select()
              .from(clubs)
              .where(eq(clubs.name, playerRow.club))
              .limit(1)
            if (club.length > 0) clubId = club[0].id
          }

          // Extract primary position (first position if multiple)
          const positions = playerRow.positions?.split(',') || ['ST']
          const primaryPosition = positions[0]?.trim() || 'ST'

          const playerData = {
            name: playerRow.name || playerRow.full_name,
            age: parseInt(playerRow.age) || 25,
            height: parseInt(playerRow.height_cm) || 180,
            weight: parseInt(playerRow.weight_kgs) || 75,
            preferredFoot: playerRow.preferred_foot || 'right',
            primaryPosition,
            overallRating: parseInt(playerRow.overall_rating) || 70,
            potential: parseInt(playerRow.potential) || 75,
            marketValue: parseInt(playerRow.value_euro) || 0,
            clubId,
            countryId: playerCountry[0].id,
          }

          playerBatch.push(playerData)

          // Player attributes
          attributesBatch.push({
            pace: parseInt(playerRow.acceleration) || 50,
            shooting: parseInt(playerRow.finishing) || 50,
            passing: parseInt(playerRow.short_passing) || 50,
            dribbling: parseInt(playerRow.dribbling) || 50,
            defending: parseInt(playerRow.standing_tackle) || 50,
            physical: parseInt(playerRow.strength) || 50,
            vision: parseInt(playerRow.vision) || 50,
            positioning: parseInt(playerRow.positioning) || 50,
            crossing: parseInt(playerRow.crossing) || 50,
            finishing: parseInt(playerRow.finishing) || 50,
            heading: parseInt(playerRow.heading_accuracy) || 50,
            longShots: parseInt(playerRow.long_shots) || 50,
            standingTackle: parseInt(playerRow.standing_tackle) || 50,
            jumping: parseInt(playerRow.jumping) || 50,
            strength: parseInt(playerRow.strength) || 50,
            stamina: parseInt(playerRow.stamina) || 50,
            acceleration: parseInt(playerRow.acceleration) || 50,
            sprintSpeed: parseInt(playerRow.sprint_speed) || 50,
            agility: parseInt(playerRow.agility) || 50,
            reactions: parseInt(playerRow.reactions) || 50,
          })
        } catch (error) {
          playersSkipped++
          continue
        }
      }

      // Insert batch
      if (playerBatch.length > 0) {
        const inserted = await db
          .insert(players)
          .values(playerBatch)
          .returning({ id: players.id })

        // Link attributes to players
        for (let j = 0; j < inserted.length; j++) {
          attributesBatch[j].playerId = inserted[j].id
        }

        if (attributesBatch.length > 0) {
          await db.insert(playerAttributes).values(attributesBatch)
        }

        playersInserted += inserted.length
        console.log(`  ✓ Inserted ${playersInserted} players...`)
      }
    }

    console.log(`\n✅ Seeding complete!`)
    console.log(`  📊 Players inserted: ${playersInserted}`)
    console.log(`  ⏭️  Players skipped: ${playersSkipped}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

seedDatabase()
