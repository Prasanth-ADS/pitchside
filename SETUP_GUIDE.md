# DraftDay - Football Auction Platform Setup Guide

## Overview

DraftDay is a real-time football player auction platform built with Next.js, PostgreSQL, and WebSockets. The app includes 17,956 FIFA players ready for auction drafting.

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (Neon recommended)
- Vercel account for deployment

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

The database connection is already configured via Neon integration.

#### Run Migration
Create all necessary database tables:

```bash
pnpm migrate
```

This creates:
- `countries` - Player nationalities
- `leagues` - Football leagues (La Liga, Premier League, etc.)
- `clubs` - Football clubs
- `players` - Player data with ratings and attributes
- `player_attributes` - Detailed player stats (pace, shooting, passing, etc.)
- `rooms` - Auction room sessions
- `players_in_room` - Players available in each auction
- `bids` - Bid history
- `chat_messages` - Room chat

#### Seed FIFA Players
Load 17,956 real FIFA players into the database:

```bash
pnpm seed:fifa
```

This populates the database with:
- All 17,956 FIFA players with ratings (50-99)
- 20 player attributes per player
- 50+ countries
- 20+ major football clubs
- Multiple leagues

**Note:** This process takes ~10-15 minutes for full data import.

### 3. Configure Environment Variables

The following variables are automatically set via Neon integration:
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_URL` - Alternative PostgreSQL URL
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_USER` - Database user
- `POSTGRES_DATABASE` - Database name

### 4. Run Development Server

```bash
pnpm dev
```

Navigate to `http://localhost:3000`

## Usage

### Create a Room
1. Click "Create Room" on homepage
2. Enter room name and configure settings:
   - Budget per team: 100 (default)
   - Timer per player: 300 seconds (default)
3. Share the room code with friends

### Join a Room
1. Enter room code on homepage
2. Enter your name
3. Join the auction

### Auction Features
- **Real-time bidding** via WebSocket SSE
- **Auto-sell** when timer expires
- **Player ratings** (Overall 50-99, Potential up to 95+)
- **Position-based filtering** (ST, CF, CM, CB, GK, etc.)
- **Team composition** sidebar tracking
- **Bid history** with player details
- **Export results** as CSV/JSON

### Host Controls
- Skip player and move to next
- Finalize sales manually
- Pause/resume auction
- Edit timer mid-session

## Key Features

### Player Database
- **17,956 real FIFA players** with authentic ratings
- **20 detailed attributes** per player:
  - Pace, Shooting, Passing, Dribbling
  - Defending, Physical, Vision, Positioning
  - Crossing, Finishing, Heading, Long Shots
  - Tackle, Jumping, Strength, Stamina
  - Acceleration, Sprint Speed, Agility, Reactions

### Real-time Updates
- Server-Sent Events (SSE) for live auction updates
- Instant bid notifications
- Player status synchronization
- Chat integration

### Auction Management
- Dynamic pricing based on bids
- Multiple positions (ST, CM, CB, GK, etc.)
- Budget tracking per team
- Automatic progression to next player

### Results & Export
- Final standings with stats
- Squad composition per team
- Export as CSV for Excel
- Export as JSON for analysis
- Per-player bid history

## Deployment to Vercel

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Deploy to Vercel
1. Go to https://vercel.com/new
2. Select your GitHub repository
3. Vercel auto-detects Next.js project
4. Add environment variables:
   - Copy `DATABASE_URL` from Neon integration
5. Click "Deploy"

### 3. Post-Deployment
After deployment, run the seed script in Vercel's CLI or dashboard:

```bash
vercel env pull
pnpm migrate
pnpm seed:fifa
```

Or use Vercel's CLI:
```bash
vercel deploy
```

## Database Schema

### Players Table
```sql
- id: SERIAL PRIMARY KEY
- name: TEXT NOT NULL
- age: INTEGER
- height: INTEGER (cm)
- weight: INTEGER (kg)
- preferred_foot: TEXT (left|right)
- primary_position: TEXT (ST, CM, CB, etc.)
- overall_rating: INTEGER (50-99)
- potential: INTEGER
- market_value: BIGINT (in euros)
- club_id: FK to clubs
- country_id: FK to countries
```

### Player Attributes Table
```sql
- player_id: FK to players (PRIMARY KEY)
- pace: INTEGER (1-99)
- shooting: INTEGER (1-99)
- passing: INTEGER (1-99)
- dribbling: INTEGER (1-99)
- defending: INTEGER (1-99)
- physical: INTEGER (1-99)
- vision: INTEGER (1-99)
- positioning: INTEGER (1-99)
- ... and 12 more attributes
```

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Reconnect and migrate
pnpm migrate

# Re-seed if needed
pnpm seed:fifa
```

### Seeding Takes Too Long
- The seed script processes 17,956 players
- First import can take 10-15 minutes
- Subsequent runs only add new players
- Check database logs for errors

### WebSocket Issues
- Ensure WebSocket support enabled in hosting
- Check SSE endpoint: `/api/rooms/[code]/sse`
- Verify no CORS issues on frontend

### Missing Players in Auction
- Run migration: `pnpm migrate`
- Verify seed completed: Check database row count
- Check player filters aren't excluding all players

## Performance Optimization

### Database
- Indexed fields: `players.overall_rating`, `clubs.name`, `countries.name`
- Connection pooling via Neon
- Batch player inserts in seed script

### Frontend
- SWR for data fetching with caching
- SSE for real-time updates
- Virtual scrolling for large player lists
- Memoized components

### Deployment
- Next.js static generation for pages
- API route caching
- CDN integration via Vercel
- Database connection pooling

## API Endpoints

### Rooms
- `POST /api/rooms` - Create new auction room
- `GET /api/rooms/[code]` - Get room details
- `PATCH /api/rooms/[code]` - Update room status
- `GET /api/rooms/[code]/sse` - SSE stream for real-time updates

### Players
- `GET /api/players` - List all players with filters
- `GET /api/players/[id]` - Get player details
- `GET /api/players/search` - Search players

### Bids
- `POST /api/bids` - Place a bid
- `GET /api/bids/[roomCode]` - Get bid history

## Support & Contributing

For issues or feature requests, check the GitHub repository or open an issue.

## License

MIT License - See LICENSE file for details

## Credits

Player data sourced from FIFA game database with 17,956 authentic players, clubs, and ratings.
