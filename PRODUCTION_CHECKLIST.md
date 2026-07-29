# DraftDay - Production Launch Checklist

## Pre-Launch (This Week)

### Code & Deployment
- [ ] Pull latest code with audit fixes
- [ ] Run `npm install` to get any new dependencies
- [ ] Verify TypeScript compiles: `npm run build`
- [ ] Test locally in dev environment
- [ ] Deploy to staging environment

### Database
- [ ] Backup production database
- [ ] Create database migration run plan
- [ ] Run SQL migrations during off-peak hours:
  ```bash
  psql -d your_production_db -f DATABASE_MIGRATIONS.sql
  ```
- [ ] Verify all indexes created successfully
- [ ] Validate no slow queries in logs

### Testing
- [ ] Race condition test: Two users bid simultaneously
  - Expected: One wins, one bid rejected
  - [ ] Bid history shows only one bid
  - [ ] Winner's budget deducted, loser's unchanged
  
- [ ] Duplicate prevention test: Rapid bid clicks
  - Expected: Only one bid recorded
  - [ ] Check bid history - no duplicates
  
- [ ] Timer validation test
  - Expected: Auto-finalize at timer expiration
  - [ ] Verify on server-side, not just client
  
- [ ] Disconnect/reconnect test
  - Expected: State preserved, no duplicate events
  - [ ] Bid history intact
  - [ ] Chat history intact
  - [ ] Budget correct
  
- [ ] Rate limiting test: Spam chat
  - Expected: After 5 messages in 10s, rate limited
  - [ ] 6th message rejected with error message
  - [ ] After 10s, can send again

### Performance
- [ ] Load test: 100 concurrent users
  - [ ] Monitor latency: < 500ms for bid confirmation
  - [ ] Monitor memory: stays < 1GB
  - [ ] Monitor database: < 5 connections per user
  - [ ] Check error rate: < 0.1%
  
- [ ] Stress test: 1000 bids/second
  - [ ] No dropped bids
  - [ ] No duplicate players
  - [ ] No database timeouts

### Monitoring & Alerting
- [ ] Set up error tracking (Sentry)
  - [ ] Alert on error rate > 1%
  - [ ] Alert on 5xx responses
  
- [ ] Set up performance monitoring
  - [ ] Alert on query time > 5s
  - [ ] Alert on bid latency > 1s
  - [ ] Alert on SSE connection count > 1000
  - [ ] Alert on memory usage > 80%
  
- [ ] Configure database slow query logging
  - [ ] Set `log_min_duration_statement = 1000`
  - [ ] Review logs daily for first week
  
- [ ] Set up dashboards
  - [ ] Bid latency (p50, p95, p99)
  - [ ] Error rate by endpoint
  - [ ] SSE connection count
  - [ ] Database connection pool usage

### Documentation
- [ ] Share audit report with team: `PRODUCTION_AUDIT_REPORT.md`
- [ ] Share implementation guide: `IMPLEMENTATION_GUIDE.md`
- [ ] Share this checklist with ops team
- [ ] Document on-call procedures for issues

### Deployment Dry Run
- [ ] Practice deployment steps
- [ ] Practice rollback procedure
- [ ] Brief ops team on new features
- [ ] Test database migration on staging

---

## Launch Day

### Pre-Launch (30 minutes before)
- [ ] All tests passing
- [ ] All alerts configured
- [ ] Monitoring dashboards ready
- [ ] On-call engineer available
- [ ] Rollback plan reviewed

### Launch Steps (Execute in order)
1. [ ] Stop accepting new room creation (disable button if needed)
2. [ ] Wait for active auctions to complete
3. [ ] Backup database one final time
4. [ ] Run database migrations: `psql -d db -f DATABASE_MIGRATIONS.sql`
5. [ ] Deploy backend code
6. [ ] Deploy frontend code
7. [ ] Verify homepage loads
8. [ ] Test: Create room → Join room → Start auction → Place bid
9. [ ] Monitor error rate for 5 minutes
10. [ ] Monitor latency for 5 minutes
11. [ ] Check database slow query log
12. [ ] Re-enable new room creation
13. [ ] Announce to users: system is live

### Post-Launch (First 1 Hour)
- [ ] Monitor error rate (target: < 0.1%)
- [ ] Monitor latency (target: < 500ms)
- [ ] Monitor database connections (target: < 100)
- [ ] Monitor memory usage (target: < 500MB)
- [ ] Check for any new issues in logs
- [ ] Respond to user feedback in real-time

### Post-Launch (First 24 Hours)
- [ ] Monitor all metrics continuously
- [ ] Check database for slow queries
- [ ] Review error logs for patterns
- [ ] Verify backup/restore works
- [ ] Document any issues encountered
- [ ] Plan any post-launch improvements

---

## Rollback Plan (If Issues Occur)

### Critical Issues (Rollback Immediately)
- Error rate > 5%
- Database unreachable
- Memory leak detected
- Bids not being recorded

### Rollback Steps
1. [ ] Stop accepting new requests (return 503)
2. [ ] Verify database is healthy
3. [ ] Restore previous deployment
4. [ ] Clear SSE broadcaster (restart server)
5. [ ] Verify system functional
6. [ ] Announce status to users
7. [ ] Post-mortem with team

---

## High-Priority Items (Week 1)

### By End of Day 1
- [ ] Monitor production for 24 hours
- [ ] Review all error logs
- [ ] Confirm all metrics normal

### By End of Week 1
- [ ] Implement auction pause/resume
- [ ] Add position validation
- [ ] Add host timeout handling
- [ ] Server-side timer validation

---

## Ongoing (Weekly)

- [ ] Review database slow query logs
- [ ] Optimize any queries taking > 1s
- [ ] Check index fragmentation
- [ ] Review error patterns
- [ ] User feedback review
- [ ] Performance trend analysis

---

## Emergency Contacts

| Role | Name | Email | Phone |
|------|------|-------|-------|
| Primary On-Call | [Your Name] | [email] | [phone] |
| Database Admin | [Your Name] | [email] | [phone] |
| DevOps Lead | [Your Name] | [email] | [phone] |
| Product Lead | [Your Name] | [email] | [phone] |

---

## Critical Issue Response

### If bid is not recorded:
1. Check database directly: `SELECT * FROM bids ORDER BY bid_at DESC LIMIT 1`
2. Check error logs for SQL error
3. Verify transaction isolation level
4. Contact database admin immediately

### If auctions are slow:
1. Check query times: `SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10`
2. Verify indexes exist
3. Check database connection pool usage
4. Restart application if necessary

### If memory is growing:
1. Check SSE connection count
2. Verify cleanup is running
3. Check for leaked event listeners
4. Restart application if > 80%

### If users are rate limited:
1. Check if legitimate traffic spike
2. Verify rate limit values are appropriate
3. Update limits if needed
4. Monitor for abuse patterns

---

## Success Criteria

✅ **Reliability**
- [ ] Uptime: 99.9%
- [ ] Error rate: < 0.1%
- [ ] No data loss

✅ **Performance**
- [ ] Bid latency: < 500ms (p95)
- [ ] Snapshot load: < 100ms
- [ ] Chat message: < 200ms

✅ **Stability**
- [ ] Memory stable over 24h
- [ ] No memory leaks detected
- [ ] No database connection exhaustion

✅ **Security**
- [ ] No duplicate bids
- [ ] No budget overages
- [ ] Rate limiting working
- [ ] No SQL injection attempts successful

✅ **User Experience**
- [ ] Auctions complete quickly (2-5 min/player)
- [ ] Real-time updates working
- [ ] Reconnection seamless
- [ ] Error messages helpful

---

## Sign-Off

**Project Manager**: _________________ Date: _______

**Tech Lead**: _________________ Date: _______

**DevOps Lead**: _________________ Date: _______

**Product Lead**: _________________ Date: _______

---

## Notes

```
[Space for deployment notes, issues encountered, lessons learned]




```

---

*This checklist is LIVE - update as new items arise*  
*Last Updated: July 28, 2024*  
*Version: 1.0*
