# Deployment Guide - DraftDay

## Overview

DraftDay is ready to deploy to Vercel. The application includes a PostgreSQL database via Neon integration with 17,956+ FIFA players.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub repository (already connected)
- Neon PostgreSQL database (already integrated)

## Deployment Steps

### 1. Deploy to Vercel

The simplest way to deploy is using the Vercel Dashboard:

**Option A: Vercel Dashboard (Recommended)**
1. Go to https://vercel.com/dashboard
2. Click "Import Project"
3. Select GitHub repository `Prasanth-ADS/pitchside`
4. Vercel auto-detects Next.js configuration
5. Ensure environment variables are set:
   - `DATABASE_URL` - From Neon integration (should auto-populate)
   - `POSTGRES_URL` - Alternative URL (optional)
6. Click "Deploy"

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel login
vercel deploy
```

### 2. Initialize Database (Post-Deployment)

After deployment, initialize the database:

#### Using Vercel Serverless Functions (Recommended)

Create a one-time setup endpoint:

```bash
# Option 1: Use curl to trigger migrations
curl https://your-deployment.vercel.app/api/setup/migrate

# Option 2: Check Vercel dashboard for recent deployments
vercel logs
```

#### Using CLI

```bash
# Pull environment variables
vercel env pull

# Run migrations locally
pnpm migrate

# Seed FIFA data
pnpm seed:fifa
```

### 3. Verify Deployment

1. **Check Build Logs**
   - Go to Vercel Dashboard
   - Select your project
   - View recent deployment logs

2. **Test Live Site**
   - Visit your deployment URL
   - Homepage should load without errors
   - Database connection should be active

3. **Verify Players Database**
   ```bash
   # Connect to your production database
   psql $DATABASE_URL

   # Check player count
   SELECT COUNT(*) FROM players;
   ```

## Post-Deployment Configuration

### 1. Environment Variables

Verify these are set in Vercel:

```
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
NODE_ENV=production
```

Check in Vercel Dashboard:
- Project Settings → Environment Variables

### 2. Database Seeding Status

Monitor seeding progress:

```bash
# SSH into Vercel deployment (if needed)
vercel logs --follow

# Or check database directly
vercel env pull
psql $DATABASE_URL -c "SELECT COUNT(*) as players FROM players;"
```

### 3. SSL/TLS Configuration

Neon automatically provides SSL certificates. Vercel handles the rest.

## Custom Domain Setup

1. Go to Vercel Project Settings
2. Select "Domains"
3. Add your custom domain
4. Follow DNS instructions
5. Vercel auto-provisions SSL certificate

## Monitoring & Logs

### Vercel Dashboard
- Real-time deployment logs
- Build status and errors
- Function execution logs
- Database connection tracking

### View Logs
```bash
vercel logs           # Recent logs
vercel logs --follow  # Live streaming logs
```

## Rollback

If deployment fails:

1. Vercel Dashboard → Deployments
2. Click the previous successful deployment
3. Click "Redeploy"
4. Or use CLI: `vercel rollback`

## Troubleshooting

### Issue: Database Connection Failed

**Solution:**
```bash
# Verify DATABASE_URL is set
vercel env ls

# Test connection locally
POSTGRES_URL=$DATABASE_URL psql -c "SELECT 1"

# Check Neon dashboard for connection pool status
```

### Issue: Players Not Loading

**Solution:**
```bash
# Check if seeding completed
psql $DATABASE_URL -c "SELECT COUNT(*) FROM players;"

# If empty, trigger seeding endpoint
curl https://your-deployment.vercel.app/api/setup/seed
```

### Issue: Build Fails with Type Errors

**Solution:**
```bash
# Verify TypeScript locally
pnpm run build

# Check specific errors
pnpm exec tsc --noEmit
```

## Performance Optimization

### Vercel Deployment
- Automatic image optimization
- Edge caching
- CDN distribution
- Automatic scaling

### Database
- Connection pooling via Neon
- Prepared statements
- Indexed queries
- Batch operations

## Security Checklist

- [ ] Environment variables are secret (not logged)
- [ ] Database credentials not in code
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured for domain
- [ ] Rate limiting enabled
- [ ] SQL injection protection (Drizzle ORM)

## Backup & Recovery

### Neon Backups
- Automatic daily backups
- 7-day retention
- Manual backup available in Neon dashboard

### Recovery
```bash
# Neon Dashboard → Branches → Restore from backup
```

## Scaling

### For Increased Traffic

1. **Database**: Neon auto-scales connections
2. **Compute**: Vercel auto-scales serverless functions
3. **CDN**: Vercel global edge network (automatic)

### Monitoring Usage
- Vercel Analytics Dashboard
- Neon database metrics
- API usage patterns

## Cost Optimization

### Vercel
- Free tier covers most use cases
- ~$20/month for Pro plan
- Pay-as-you-go for additional usage

### Neon
- Free tier: 10 GB storage, 5 parallel connections
- ~$15/month for Pro plan
- Auto-scaling as needed

## Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] Player data seeded
- [ ] Build succeeds locally
- [ ] Type checking passes
- [ ] Deployed to Vercel
- [ ] Homepage loads
- [ ] Database connection active
- [ ] Players visible in app
- [ ] Real-time features working
- [ ] Export functionality working

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: Prasanth-ADS/pitchside

## Next Steps

After successful deployment:

1. Share deployment URL with friends
2. Create test auction room
3. Verify real-time bidding works
4. Test player export functionality
5. Monitor performance metrics

---

**Deployment Status**: ✅ Ready to deploy

Questions? Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) or [README.md](./README.md)
