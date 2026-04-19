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
    console.log('Adding user_id column to flashcards table...');
    // Add as nullable to avoid data loss issues, then we could migrate if needed
    // But since this is a new feature we just want the column there.
    await sql`ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS user_id uuid;`;
    
    // Also insure other columns from our new schema are there
    await sql`ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS ease_factor decimal(5,2) DEFAULT 2.5;`;
    await sql`ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS next_review timestamptz;`;
    await sql`ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS interval integer DEFAULT 0;`;
    await sql`ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();`;

    console.log('Success!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to update table:', err);
    process.exit(1);
  }
}

main();
