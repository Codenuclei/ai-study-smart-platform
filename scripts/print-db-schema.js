// This script fetches the current DB schema and prints it for comparison
import { Client } from 'pg';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

async function main() {
  await client.connect();
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  `);

  for (const row of tables.rows) {
    const table = row.table_name;
    console.log(`\nTable: ${table}`);
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [table]);
    for (const col of columns.rows) {
      console.log(`  ${col.column_name} | ${col.data_type} | nullable: ${col.is_nullable} | default: ${col.column_default}`);
    }
  }
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
