
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(databaseUrl);

const initDatabase = async () => {
  try {
    console.log('Running migration script migration-2026-04-21.sql...');
    const migrationPath = path.join(__dirname, 'migration-2026-04-21.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split on semicolon, filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const stmt of statements) {
      await sql([stmt]);
    }
    console.log('✅ Migration complete.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

initDatabase();
