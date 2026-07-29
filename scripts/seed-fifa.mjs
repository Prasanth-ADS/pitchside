import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
})

// Country code mapping
const countryCodeMap = {
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
  'United States': 'USA',
  'Canada': 'CAN',
  'Australia': 'AUS',
}

// Country flag mapping
const countryFlagMap = {
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
  'United States': '🇺🇸',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
}

function parseCSVLine(line) {
  const result = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        i++
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

async function seedDatabase() {
  const client = await pool.connect()
  try {
    console.log('🌱 Starting FIFA player database seed...')
    console.log('📊 Connecting to database...')

    // 1. Clear existing data
    console.log('🧹 Clearing existing data...')
    await client.query('DELETE FROM player_attributes')
    await client.query('DELETE FROM players')
    await client.query('DELETE FROM clubs')
    await client.query('DELETE FROM leagues')
    await client.query('DELETE FROM countries')

    // 2. Seed countries
    console.log('🌍 Seeding countries...')
    const uniqueCountries = [...new Set(Object.keys(countryCodeMap))]
    for (const countryName of uniqueCountries) {
      const code = countryCodeMap[countryName]
      const flag = countryFlagMap[countryName] || '🚩'
      await client.query(
        'INSERT INTO countries (name, code, flag_emoji) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [countryName, code, flag]
      )
    }

    // 3. Seed leagues
    console.log('🏆 Seeding leagues...')
    const leaguesData = [
      { name: 'La Liga', country: 'Spain' },
      { name: 'Premier League', country: 'England' },
      { name: 'Ligue 1', country: 'France' },
      { name: 'Bundesliga', country: 'Germany' },
      { name: 'Serie A', country: 'Italy' },
      { name: 'Eredivisie', country: 'Netherlands' },
      { name: 'Liga NOS', country: 'Portugal' },
      { name: 'Pro League', country: 'Belgium' },
    ]

    for (const league of leaguesData) {
      const countryRes = await client.query(
        'SELECT id FROM countries WHERE name = $1',
        [league.country]
      )
      if (countryRes.rows.length > 0) {
        await client.query(
          'INSERT INTO leagues (name, country_id, tier) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
          [league.name, countryRes.rows[0].id, 1]
        )
      }
    }

    // 4. Seed top clubs
    console.log('⚽ Seeding clubs...')
    const clubsData = [
      { name: 'Real Madrid', league: 'La Liga' },
      { name: 'Barcelona', league: 'La Liga' },
      { name: 'Atlético Madrid', league: 'La Liga' },
      { name: 'Manchester United', league: 'Premier League' },
      { name: 'Manchester City', league: 'Premier League' },
      { name: 'Liverpool', league: 'Premier League' },
      { name: 'Arsenal', league: 'Premier League' },
      { name: 'Chelsea', league: 'Premier League' },
      { name: 'Tottenham Hotspur', league: 'Premier League' },
      { name: 'Paris Saint-Germain', league: 'Ligue 1' },
      { name: 'Olympique Marseille', league: 'Ligue 1' },
      { name: 'Bayern Munich', league: 'Bundesliga' },
      { name: 'Borussia Dortmund', league: 'Bundesliga' },
      { name: 'Juventus', league: 'Serie A' },
      { name: 'AC Milan', league: 'Serie A' },
      { name: 'Inter Milan', league: 'Serie A' },
      { name: 'Ajax', league: 'Eredivisie' },
      { name: 'PSV Eindhoven', league: 'Eredivisie' },
      { name: 'Benfica', league: 'Liga NOS' },
      { name: 'Porto', league: 'Liga NOS' },
    ]

    for (const club of clubsData) {
      const leagueRes = await client.query(
        'SELECT id, country_id FROM leagues WHERE name = $1',
        [club.league]
      )
      if (leagueRes.rows.length > 0) {
        await client.query(
          'INSERT INTO clubs (name, short_name, league_id, country_id) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [club.name, club.name.substring(0, 3).toUpperCase(), leagueRes.rows[0].id, leagueRes.rows[0].country_id]
        )
      }
    }

    // 5. Read and parse FIFA CSV
    console.log('📖 Reading FIFA players CSV...')
    const csvPath = path.join(path.dirname(__dirname), 'data', 'fifa_players.csv')
    console.log(`📁 CSV path: ${csvPath}`)

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`)
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = fileContent.split('\n').filter((line) => line.trim())

    const headerLine = lines[0]
    const headers = parseCSVLine(headerLine)
    const headerIndex = {}
    headers.forEach((h, i) => {
      headerIndex[h] = i
    })

    console.log(`📥 Parsing ${lines.length - 1} players from FIFA data...`)

    let playersInserted = 0
    let playersSkipped = 0
    const batchSize = 50

    // Process players in batches
    for (let i = 1; i < lines.length; i += batchSize) {
      const batch = lines.slice(i, Math.min(i + batchSize, lines.length))

      for (const line of batch) {
        if (!line.trim()) continue

        try {
          const values = parseCSVLine(line)
          const playerData = {}
          headers.forEach((h, idx) => {
            playerData[h] = values[idx] || ''
          })

          const nationality = playerData.nationality || ''
          const countryRes = await client.query(
            'SELECT id FROM countries WHERE name = $1',
            [nationality]
          )

          if (countryRes.rows.length === 0) {
            playersSkipped++
            continue
          }

          const countryId = countryRes.rows[0].id

          // Get club if exists
          let clubId = null
          const clubName = playerData.club_name || playerData.club || ''
          if (clubName) {
            const clubRes = await client.query(
              'SELECT id FROM clubs WHERE name ILIKE $1 LIMIT 1',
              [clubName]
            )
            if (clubRes.rows.length > 0) {
              clubId = clubRes.rows[0].id
            }
          }

          // Extract primary position
          const positions = (playerData.positions || 'ST').split(',')
          const primaryPosition = (positions[0] || 'ST').trim()

          const playerName = playerData.name || playerData.full_name || 'Unknown'
          const age = parseInt(playerData.age) || 25
          const height = parseInt(playerData.height_cm) || 180
          const weight = parseInt(playerData.weight_kgs) || 75
          const preferredFoot = playerData.preferred_foot || 'right'
          const overallRating = parseInt(playerData.overall_rating) || 70
          const potential = parseInt(playerData.potential) || 75
          const marketValue = parseInt(playerData.value_euro) || 0

          // Insert player
          const playerRes = await client.query(
            `INSERT INTO players (name, age, height, weight, preferred_foot, primary_position, overall_rating, potential, market_value, club_id, country_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id`,
            [playerName, age, height, weight, preferredFoot, primaryPosition, overallRating, potential, marketValue, clubId, countryId]
          )

          if (playerRes.rows.length > 0) {
            const playerId = playerRes.rows[0].id

            // Insert attributes
            const attributes = {
              pace: Math.min(99, parseInt(playerData.acceleration) || 50),
              shooting: Math.min(99, parseInt(playerData.finishing) || 50),
              passing: Math.min(99, parseInt(playerData.short_passing) || 50),
              dribbling: Math.min(99, parseInt(playerData.dribbling) || 50),
              defending: Math.min(99, parseInt(playerData.standing_tackle) || 50),
              physical: Math.min(99, parseInt(playerData.strength) || 50),
              vision: Math.min(99, parseInt(playerData.vision) || 50),
              positioning: Math.min(99, parseInt(playerData.positioning) || 50),
              crossing: Math.min(99, parseInt(playerData.crossing) || 50),
              finishing: Math.min(99, parseInt(playerData.finishing) || 50),
              heading: Math.min(99, parseInt(playerData.heading_accuracy) || 50),
              long_shots: Math.min(99, parseInt(playerData.long_shots) || 50),
              standing_tackle: Math.min(99, parseInt(playerData.standing_tackle) || 50),
              jumping: Math.min(99, parseInt(playerData.jumping) || 50),
              strength: Math.min(99, parseInt(playerData.strength) || 50),
              stamina: Math.min(99, parseInt(playerData.stamina) || 50),
              acceleration: Math.min(99, parseInt(playerData.acceleration) || 50),
              sprint_speed: Math.min(99, parseInt(playerData.sprint_speed) || 50),
              agility: Math.min(99, parseInt(playerData.agility) || 50),
              reactions: Math.min(99, parseInt(playerData.reactions) || 50),
            }

            await client.query(
              `INSERT INTO player_attributes (player_id, pace, shooting, passing, dribbling, defending, physical, vision, positioning, crossing, finishing, heading, long_shots, standing_tackle, jumping, strength, stamina, acceleration, sprint_speed, agility, reactions)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
              [
                playerId,
                attributes.pace,
                attributes.shooting,
                attributes.passing,
                attributes.dribbling,
                attributes.defending,
                attributes.physical,
                attributes.vision,
                attributes.positioning,
                attributes.crossing,
                attributes.finishing,
                attributes.heading,
                attributes.long_shots,
                attributes.standing_tackle,
                attributes.jumping,
                attributes.strength,
                attributes.stamina,
                attributes.acceleration,
                attributes.sprint_speed,
                attributes.agility,
                attributes.reactions,
              ]
            )

            playersInserted++

            if (playersInserted % 500 === 0) {
              console.log(`  ✓ Inserted ${playersInserted} players...`)
            }
          }
        } catch (error) {
          playersSkipped++
          continue
        }
      }
    }

    console.log(`\n✅ Seeding complete!`)
    console.log(`  📊 Players inserted: ${playersInserted}`)
    console.log(`  ⏭️  Players skipped: ${playersSkipped}`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

seedDatabase()
