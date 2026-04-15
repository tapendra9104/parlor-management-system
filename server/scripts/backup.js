/**
 * ============================================
 * SalonFlow — Backup Script
 * ============================================
 * Automated database backup using native MongoDB.
 * Can be scheduled via cron or Task Scheduler.
 *
 * Usage: node server/scripts/backup.js
 *
 * Gap #5: Database Backups
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BACKUP_DIR = path.join(__dirname, '..', '..', 'backups');
const MAX_BACKUPS = 14; // Keep last 14 backups

const runBackup = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T').join('_').slice(0, 19);
  const backupPath = path.join(BACKUP_DIR, `backup_${timestamp}`);

  // Ensure backup directory exists
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('❌ MONGODB_URI not set in environment');
    process.exit(1);
  }

  console.log(`📦 Starting backup: ${backupPath}`);
  console.log(`🕐 Time: ${new Date().toISOString()}`);

  try {
    execSync(`mongodump --uri="${mongoUri}" --out="${backupPath}"`, {
      stdio: 'inherit',
    });
    console.log(`✅ Backup completed successfully: ${backupPath}`);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    console.log('ℹ️  Make sure MongoDB Database Tools are installed:');
    console.log('   https://www.mongodb.com/try/download/database-tools');
    process.exit(1);
  }

  // Cleanup old backups
  cleanupOldBackups();
};

const cleanupOldBackups = () => {
  if (!fs.existsSync(BACKUP_DIR)) return;

  const backups = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith('backup_'))
    .sort()
    .reverse();

  if (backups.length > MAX_BACKUPS) {
    const toDelete = backups.slice(MAX_BACKUPS);
    toDelete.forEach((backup) => {
      const fullPath = path.join(BACKUP_DIR, backup);
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`🗑️  Removed old backup: ${backup}`);
    });
  }
};

runBackup();
