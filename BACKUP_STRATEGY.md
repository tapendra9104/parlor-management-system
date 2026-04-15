# SalonFlow — Database Backup & Disaster Recovery

## Gap #5: Backup Strategy

---

## MongoDB Atlas Backups (Automated)

If using **MongoDB Atlas** (recommended for production):

### Enable Continuous Backup
1. Go to Atlas Dashboard → Your Cluster → **Backup**
2. Enable **Cloud Backup**
3. Set backup policy:
   - **Snapshot frequency**: Every 6 hours
   - **Snapshot retention**: 7 days
   - **Daily snapshots**: 30 days
   - **Weekly snapshots**: 8 weeks
   - **Monthly snapshots**: 12 months

### Point-in-Time Recovery
Atlas M10+ clusters support continuous backup with point-in-time recovery up to the last 24 hours.

---

## Manual Backup (mongodump)

### Prerequisites
```bash
npm install -g mongodump
# or use MongoDB Database Tools: https://www.mongodb.com/try/download/database-tools
```

### Backup Command
```bash
# Local MongoDB
mongodump --uri="mongodb://localhost:27017/salonflow" --out=./backups/$(date +%Y%m%d_%H%M%S)

# MongoDB Atlas
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/salonflow" --out=./backups/$(date +%Y%m%d_%H%M%S)
```

### Automated Backup Script
Run the backup script:
```bash
node server/scripts/backup.js
```

### Schedule with Cron (Linux)
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/salonflow && node server/scripts/backup.js >> /var/log/salonflow-backup.log 2>&1
```

### Schedule with Task Scheduler (Windows)
1. Open Task Scheduler
2. Create Basic Task → "SalonFlow Backup"
3. Trigger: Daily at 2:00 AM
4. Action: Start `node`, Arguments: `server/scripts/backup.js`

---

## Restore Procedures

### From mongodump
```bash
# Restore to local
mongorestore --uri="mongodb://localhost:27017/salonflow" --drop ./backups/20260415_020000/

# Restore to Atlas
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/salonflow" --drop ./backups/20260415_020000/
```

### From Atlas Snapshot
1. Atlas Dashboard → Backup → Snapshots
2. Click "Restore" on desired snapshot
3. Choose target cluster or download

---

## Disaster Recovery Plan

### RTO (Recovery Time Objective): 1 hour
### RPO (Recovery Point Objective): 6 hours

### Scenarios

| Scenario | Recovery Steps | Time |
|----------|---------------|------|
| **Database corruption** | Restore from latest Atlas snapshot | 15 min |
| **Accidental deletion** | Restore specific collection from backup | 30 min |
| **Complete server failure** | Deploy new server → restore DB from backup → update DNS | 1 hour |
| **Region outage** | Failover to secondary Atlas region (if configured) | 5 min |

### Critical Data Priority
1. **Payments** — Financial records must never be lost
2. **Appointments** — Active bookings are business-critical
3. **Users** — Customer data and auth info
4. **Services/Inventory** — Can be re-entered if needed

---

## Verification

Run monthly backup restoration tests:
1. Restore backup to a test database
2. Verify document counts match production
3. Test critical queries (payments, appointments)
4. Document results
