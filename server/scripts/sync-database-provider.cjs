const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load server/.env if available
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

let updatedContent = schemaContent;

if (isPostgres) {
  console.log('[Prisma Sync] Detected PostgreSQL / Supabase connection URL.');
  const postgresBlock = `datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}`;
  updatedContent = updatedContent.replace(/datasource db \{[\s\S]*?\}/, postgresBlock);
} else {
  console.log('[Prisma Sync] Using SQLite local database connection.');
  const sqliteBlock = `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`;
  updatedContent = updatedContent.replace(/datasource db \{[\s\S]*?\}/, sqliteBlock);
}

if (updatedContent !== schemaContent) {
  fs.writeFileSync(schemaPath, updatedContent, 'utf8');
  console.log('[Prisma Sync] schema.prisma datasource updated.');
} else {
  console.log('[Prisma Sync] schema.prisma datasource is already up to date.');
}
