-- CRITICAL DATABASE OPTIMIZATIONS
-- Run these indexes immediately before production deployment

-- ============================================================================
-- CRITICAL INDEXES FOR PERFORMANCE
-- ============================================================================

-- CRITICAL FIX #1: Prevent N+1 queries on team players
CREATE INDEX IF NOT EXISTS idx_team_players_room_participant 
  ON team_players(room_id, participant_id);

CREATE INDEX IF NOT EXISTS idx_team_players_player 
  ON team_players(player_id);

-- CRITICAL FIX #2: Fast bid lookups
CREATE INDEX IF NOT EXISTS idx_bids_room_player_participant 
  ON bids(room_id, player_id, participant_id);

CREATE INDEX IF NOT EXISTS idx_bids_room_player_time 
  ON bids(room_id, player_id, bid_at DESC);

-- CRITICAL FIX #3: Chat message ordering
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_time 
  ON chat_messages(room_id, sent_at DESC);

-- CRITICAL FIX #4: Participant lookups
CREATE INDEX IF NOT EXISTS idx_participants_room 
  ON participants(room_id);

CREATE INDEX IF NOT EXISTS idx_participants_room_host 
  ON participants(room_id, is_host);

-- ============================================================================
-- UNIQUE CONSTRAINTS
-- ============================================================================

-- Prevent duplicate team player entries (player can only be sold once per room)
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_players_unique 
  ON team_players(room_id, player_id);

-- ============================================================================
-- QUERY OPTIMIZATION
-- ============================================================================

-- Enable query statistics for performance monitoring
-- (PostgreSQL only - run if on PostgreSQL)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- ============================================================================
-- CONNECTION POOLING
-- ============================================================================

-- If using Vercel Postgres or managed database, ensure:
-- 1. Connection pool size >= max concurrent users
-- 2. Idle timeout >= 60 seconds
-- 3. Max connections set appropriately
-- 4. Query timeout set to 30 seconds

-- ============================================================================
-- SLOW QUERY LOG
-- ============================================================================

-- Enable slow query logging (PostgreSQL)
-- ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1 second
-- ALTER SYSTEM SET log_statement = 'all';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify indexes are created:
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('team_players', 'bids', 'chat_messages', 'participants');

-- Check index size:
-- SELECT indexname, pg_size_pretty(pg_relation_size(indexrelid)) 
-- FROM pg_indexes 
-- WHERE tablename IN ('team_players', 'bids', 'chat_messages');

-- ============================================================================
-- CRITICAL CONSTRAINTS TO ADD
-- ============================================================================

-- Add NOT NULL constraints where missing
ALTER TABLE rooms ALTER COLUMN status SET NOT NULL;
ALTER TABLE participants ALTER COLUMN room_id SET NOT NULL;
ALTER TABLE bids ALTER COLUMN room_id SET NOT NULL;
ALTER TABLE bids ALTER COLUMN player_id SET NOT NULL;
ALTER TABLE chat_messages ALTER COLUMN room_id SET NOT NULL;

-- ============================================================================
-- MONITORING QUERIES
-- ============================================================================

-- Check for missing indexes on frequently queried columns:
/*
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename IN ('team_players', 'bids', 'participants', 'chat_messages')
  AND n_distinct > 100
ORDER BY n_distinct DESC;
*/

-- Check index bloat:
/*
SELECT schemaname, tablename, indexname, idx_blks_read, idx_blks_hit
FROM pg_statio_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_blks_read DESC;
*/

-- ============================================================================
-- DEPLOYMENT CHECKLIST
-- ============================================================================

-- Before going to production:
-- [ ] Run all CREATE INDEX statements above
-- [ ] Verify no slow queries in logs (> 1000ms)
-- [ ] Load test with 100 concurrent users
-- [ ] Monitor: DB connections, query times, memory usage
-- [ ] Set up alerting for > 5s query time
-- [ ] Enable Connection pooling
-- [ ] Set query timeout to 30 seconds
-- [ ] Enable slow query logging

-- ============================================================================
-- POST-DEPLOYMENT VALIDATION
-- ============================================================================

-- After deployment, run:
-- 1. SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
-- 2. Monitor connection pool usage
-- 3. Check for any > 1 second queries
-- 4. Validate bid latency is < 500ms
-- 5. Check SSE snapshot size is < 100KB
