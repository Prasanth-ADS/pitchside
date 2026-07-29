# DraftDay ⚽ - Real-Time Football Auction Platform

A modern, real-time football player auction platform built with Next.js, featuring **17,956 FIFA players** with authentic ratings and attributes. Perfect for fantasy football drafts and multiplayer auctions.

## 🎮 Key Features

- **Real-time Bidding**: Live auction with WebSocket/SSE updates
- **17,956 FIFA Players**: Complete authenticated player database
- **Multiplayer Rooms**: Create/join auction sessions with friends
- **Player Attributes**: 20+ stats per player (Pace, Shooting, Passing, etc.)
- **Team Management**: Build squads with budget constraints
- **Host Controls**: Manage auctions with skip, finalize, pause features
- **Export Results**: Download squads as CSV/JSON
- **Live Chat**: Team communication during auctions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (Neon recommended)
- pnpm

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create database schema
pnpm migrate

# 3. Seed FIFA player data (17,956 players - ~10-15 min)
pnpm seed:fifa

# 4. Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start playing!

## 📊 Database

PostgreSQL database with:
- **17,956 FIFA players** with ratings (50-99) and 20+ attributes
- **50+ clubs** from top leagues (La Liga, Premier League, Bundesliga, etc.)
- **50+ countries** with player nationalities
- **Real-time auction** tracking with bid history
- **Room management** for multiplayer sessions

### Tables
```
players (17,956 records)
├── player_attributes (20 stats each)
├── clubs (50+)
├── countries (50+)
rooms
├── players_in_room
├── bids
└── chat_messages
```

## 🎯 How to Play

1. **Create Room** - Set budget, timer, and positions
2. **Invite Friends** - Share room code
3. **Start Auction** - Begin drafting players
4. **Bid & Build** - Place bids within budget
5. **View Results** - Export final squads

## 🛠️ Tech Stack

- **Frontend**: React 19, Next.js 16, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL + Drizzle ORM
- **Real-time**: Server-Sent Events (SSE)
- **Deployment**: Vercel

## 📦 Build & Deploy

### Deploy to Vercel

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel and deploy
vercel deploy

# 3. Run in Vercel (after deployment)
vercel env pull
pnpm migrate
pnpm seed:fifa
```

**Or use Vercel Dashboard:**
1. Import GitHub repository
2. Add `DATABASE_URL` from Neon integration
3. Deploy (auto-detects Next.js)

## 📖 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup & configuration
- **[COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)** - Feature overview
- **[FEATURES_QUICK_GUIDE.md](./FEATURES_QUICK_GUIDE.md)** - Feature reference

## 💡 Player Attributes (20+ per player)

```
Offensive: Pace, Shooting, Passing, Dribbling, Finishing
Defensive: Defending, Marking, Interceptions, Tackling
Physical: Strength, Stamina, Balance, Agility
Advanced: Vision, Positioning, Reactions, Sprint Speed
Special: Acceleration, Heading, Jumping, Composure
```

## 🤝 Built with v0

This repository uses [v0](https://v0.app) for rapid development. Changes are automatically deployed to Vercel on merge to main.

## 📝 License

MIT License

---

**Built with ❤️ for football fans everywhere**

Questions? Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for help!
