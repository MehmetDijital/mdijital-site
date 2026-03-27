#!/usr/bin/env tsx
/**
 * Database Backup Script
 * 
 * This script creates a backup of the PostgreSQL database.
 * It should be run via cron job for automated backups.
 * 
 * Usage:
 *   tsx scripts/backup-db.ts
 * 
 * Environment Variables:
 *   DATABASE_URL - PostgreSQL connection string
 *   BACKUP_RETENTION_DAYS - Number of days to keep backups (default: 30)
 *   BACKUP_DIR - Directory to store backups (default: ./backups)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import logger from '../lib/logger';

const execAsync = promisify(exec);

const BACKUP_DIR = process.env.BACKUP_DIR || './backups';
const RETENTION_DAYS = parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10);
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  logger.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Parse DATABASE_URL to extract connection details
// Format: postgresql://user:password@host:port/database
const urlMatch = DATABASE_URL.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  logger.error('Invalid DATABASE_URL format');
  process.exit(1);
}

const [, dbUser, dbPassword, dbHost, dbPort, dbName] = urlMatch;

/**
 * Create backup directory if it doesn't exist
 */
async function ensureBackupDir(): Promise<void> {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    logger.info({ backupDir: BACKUP_DIR }, 'Backup directory ensured');
  } catch (error) {
    logger.error({ error, backupDir: BACKUP_DIR }, 'Failed to create backup directory');
    throw error;
  }
}

/**
 * Create a database backup
 */
async function createBackup(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup-${dbName}-${timestamp}.sql.gz`;
  const backupPath = path.join(BACKUP_DIR, backupFileName);

  // Set PGPASSWORD environment variable for pg_dump
  const env = {
    ...process.env,
    PGPASSWORD: dbPassword,
  };

  // Create backup using pg_dump
  const pgDumpCommand = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F c -f ${backupPath}`;

  try {
    logger.info({ backupPath }, 'Starting database backup');
    await execAsync(pgDumpCommand, { env });
    logger.info({ backupPath, size: (await fs.stat(backupPath)).size }, 'Backup created successfully');
    return backupPath;
  } catch (error: any) {
    logger.error({ error: error.message, backupPath }, 'Failed to create backup');
    throw error;
  }
}

/**
 * Clean up old backups based on retention policy
 */
async function cleanupOldBackups(): Promise<void> {
  try {
    const files = await fs.readdir(BACKUP_DIR);
    const now = Date.now();
    const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

    let deletedCount = 0;
    let totalFreed = 0;

    for (const file of files) {
      if (!file.startsWith('backup-') || !file.endsWith('.sql.gz')) {
        continue;
      }

      const filePath = path.join(BACKUP_DIR, file);
      const stats = await fs.stat(filePath);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > retentionMs) {
        await fs.unlink(filePath);
        deletedCount++;
        totalFreed += stats.size;
        logger.info({ file, age: Math.round(fileAge / (24 * 60 * 60 * 1000)) }, 'Deleted old backup');
      }
    }

    if (deletedCount > 0) {
      logger.info(
        { deletedCount, totalFreed, retentionDays: RETENTION_DAYS },
        'Cleanup completed'
      );
    }
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup old backups');
    // Don't throw - cleanup failure shouldn't fail the backup
  }
}

/**
 * Main backup function
 */
async function main(): Promise<void> {
  try {
    logger.info('Starting database backup process');
    
    await ensureBackupDir();
    const backupPath = await createBackup();
    await cleanupOldBackups();
    
    logger.info({ backupPath }, 'Database backup process completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Database backup process failed');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main as backupDatabase };

