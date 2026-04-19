import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

// Manual env parsing since dotenv is failing to install due to peer conflicts
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.*)/);
const dbUrl = dbUrlMatch ? dbUrlMatch[1].trim() : null;

if (!dbUrl) {
  console.error('Could not find DATABASE_URL in .env');
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  try {
    console.log('Adding user_id column to quizzes and summaries tables...');
    
    // Quizzes table updates
    await sql`ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS user_id uuid;`;
    
    // Summaries table updates
    await sql`ALTER TABLE summaries ADD COLUMN IF NOT EXISTS user_id uuid;`;

    console.log('Success!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to update tables:', err);
    process.exit(1);
  }
}

main();
