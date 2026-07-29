import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
})

async function runMigrations() {
  try {
    console.log('🔄 Running database schema creation...')

    // Get the current database connection
    const client = await pool.connect()

    try {
      // Create countries table
      await client.query(`
        CREATE TABLE IF NOT EXISTS countries (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          code CHAR(3) NOT NULL UNIQUE,
          flag_emoji TEXT
        )
      `)
      console.log('✓ Created countries table')

      // Create leagues table
      await client.query(`
        CREATE TABLE IF NOT EXISTS leagues (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          country_id INTEGER REFERENCES countries(id),
          tier INTEGER DEFAULT 1
        )
      `)
      console.log('✓ Created leagues table')

      // Create clubs table
      await client.query(`
        CREATE TABLE IF NOT EXISTS clubs (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          short_name TEXT,
          league_id INTEGER REFERENCES leagues(id),
          country_id INTEGER REFERENCES countries(id)
        )
      `)
      console.log('✓ Created clubs table')

      // Create players table
      await client.query(`
        CREATE TABLE IF NOT EXISTS players (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          age INTEGER NOT NULL,
          height INTEGER,
          weight INTEGER,
          preferred_foot TEXT DEFAULT 'right',
          primary_position TEXT NOT NULL,
          overall_rating INTEGER NOT NULL,
          potential INTEGER NOT NULL,
          market_value BIGINT DEFAULT 0,
          club_id INTEGER REFERENCES clubs(id),
          country_id INTEGER REFERENCES countries(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✓ Created players table')

      // Create player_attributes table
      await client.query(`
        CREATE TABLE IF NOT EXISTS player_attributes (
          player_id INTEGER PRIMARY KEY REFERENCES players(id),
          pace INTEGER DEFAULT 50,
          shooting INTEGER DEFAULT 50,
          passing INTEGER DEFAULT 50,
          dribbling INTEGER DEFAULT 50,
          defending INTEGER DEFAULT 50,
          physical INTEGER DEFAULT 50,
          vision INTEGER DEFAULT 50,
          positioning INTEGER DEFAULT 50,
          crossing INTEGER DEFAULT 50,
          finishing INTEGER DEFAULT 50,
          heading INTEGER DEFAULT 50,
          long_shots INTEGER DEFAULT 50,
          standing_tackle INTEGER DEFAULT 50,
          jumping INTEGER DEFAULT 50,
          strength INTEGER DEFAULT 50,
          stamina INTEGER DEFAULT 50,
          acceleration INTEGER DEFAULT 50,
          sprint_speed INTEGER DEFAULT 50,
          agility INTEGER DEFAULT 50,
          reactions INTEGER DEFAULT 50
        )
      `)
      console.log('✓ Created player_attributes table')

      // Create rooms table (new schema)
      await client.query(`
        CREATE TABLE IF NOT EXISTS rooms (
          id SERIAL PRIMARY KEY,
          code CHAR(6) NOT NULL UNIQUE,
          name TEXT NOT NULL,
          host_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'lobby',
          budget_per_team BIGINT NOT NULL DEFAULT 100000000,
          max_players_per_team INTEGER NOT NULL DEFAULT 15,
          min_players_per_team INTEGER NOT NULL DEFAULT 11,
          timer_seconds INTEGER NOT NULL DEFAULT 60,
          formation TEXT DEFAULT '4-3-3',
          current_player_id INTEGER,
          current_bid BIGINT DEFAULT 0,
          current_bidder_id TEXT,
          timer_end TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          started_at TIMESTAMP WITH TIME ZONE,
          ended_at TIMESTAMP WITH TIME ZONE
        )
      `)
      console.log('✓ Created rooms table')

      // Create participants table
      await client.query(`
        CREATE TABLE IF NOT EXISTS participants (
          id TEXT PRIMARY KEY,
          room_id INTEGER NOT NULL REFERENCES rooms(id),
          display_name TEXT NOT NULL,
          avatar_color TEXT NOT NULL DEFAULT '#3b82f6',
          budget_remaining BIGINT NOT NULL,
          is_host BOOLEAN DEFAULT false,
          joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✓ Created participants table')

      // Create team_players table
      await client.query(`
        CREATE TABLE IF NOT EXISTS team_players (
          id SERIAL PRIMARY KEY,
          room_id INTEGER NOT NULL REFERENCES rooms(id),
          participant_id TEXT NOT NULL REFERENCES participants(id),
          player_id INTEGER NOT NULL REFERENCES players(id),
          amount_paid BIGINT NOT NULL,
          acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✓ Created team_players table')

      // Create bids table (new schema)
      await client.query(`
        CREATE TABLE IF NOT EXISTS bids (
          id SERIAL PRIMARY KEY,
          room_id INTEGER NOT NULL REFERENCES rooms(id),
          player_id INTEGER NOT NULL REFERENCES players(id),
          participant_id TEXT NOT NULL REFERENCES participants(id),
          amount BIGINT NOT NULL,
          bid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✓ Created bids table')

      // Create chat_messages table (new schema)
      await client.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id SERIAL PRIMARY KEY,
          room_id INTEGER NOT NULL REFERENCES rooms(id),
          participant_id TEXT NOT NULL REFERENCES participants(id),
          display_name TEXT NOT NULL,
          avatar_color TEXT NOT NULL DEFAULT '#3b82f6',
          message TEXT NOT NULL,
          message_type TEXT NOT NULL DEFAULT 'chat',
          sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
      console.log('✓ Created chat_messages table')

      console.log('\n✅ Database schema created successfully!')
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigrations()
