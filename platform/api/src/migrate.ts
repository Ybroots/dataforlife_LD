import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import { loadPlatformEnv } from './load-env.js';

loadPlatformEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Missing DATABASE_URL');

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(currentDirectory, '../../database/migrations');
const migrationFiles = fs.readdirSync(migrationsDirectory)
  .filter((file) => file.endsWith('.sql'))
  .sort();

const client = new Client({ connectionString: databaseUrl });
await client.connect();
try {
  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDirectory, file), 'utf8');
    await client.query(sql);
    console.log(`Applied ${file}`);
  }
} finally {
  await client.end();
}
