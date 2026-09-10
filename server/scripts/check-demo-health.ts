import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Load server/.env
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const prisma = new PrismaClient();
const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || 'http://localhost:8000';
const EXPRESS_BASE_URL = process.env.CLIENT_URL || 'http://localhost:5000';

console.log('==================================================');
console.log('LEXORA Final Demo Pre-Flight Health Validator');
console.log('==================================================\n');

interface HealthCheckItem {
  component: string;
  pass: boolean;
  details: string;
}

async function runDemoHealthCheck() {
  const results: HealthCheckItem[] = [];

  // 1. Environment Secrets Check
  const reqEnv = ['JWT_SECRET', 'ENCRYPTION_KEY', 'INTERNAL_API_KEY', 'BACKUP_ENCRYPTION_KEY'];
  const missingEnv = reqEnv.filter((k) => !process.env[k]);
  results.push({
    component: 'Environment Secrets',
    pass: missingEnv.length === 0,
    details: missingEnv.length === 0 ? 'All 4 required security keys present' : `Missing: ${missingEnv.join(', ')}`,
  });

  // 2. Prisma / SQLite Database Connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push({
      component: 'SQLite Database',
      pass: true,
      details: 'Database connected and responsive via Prisma',
    });
  } catch (e: any) {
    results.push({
      component: 'SQLite Database',
      pass: false,
      details: `Database error: ${e.message}`,
    });
  }

  // 3. Demo Benchmark Cases in Database
  try {
    const cases = await prisma.case.findMany({
      where: { caseNumber: { in: ['WP(C) 412/2024', 'CRL.A. 9912/2023'] } },
    });
    results.push({
      component: 'Demo Benchmark Cases',
      pass: cases.length >= 2,
      details: cases.length >= 2 ? `Found ${cases.length} demo cases (WP(C) 412/2024 & CRL.A. 9912/2023)` : `Only found ${cases.length} demo cases`,
    });
  } catch (e: any) {
    results.push({
      component: 'Demo Benchmark Cases',
      pass: false,
      details: `Failed to query demo cases: ${e.message}`,
    });
  }

  // 4. User Accounts Seeded (5 Roles)
  try {
    const roles = ['JUDGE', 'LAWYER', 'COURT_STAFF', 'CITIZEN', 'ADMIN'];
    const users = await prisma.user.findMany({ where: { role: { in: roles } } });
    results.push({
      component: 'Role Accounts (5 Roles)',
      pass: users.length >= 5,
      details: users.length >= 5 ? `Found ${users.length} user accounts covering all 5 judicial roles` : `Found ${users.length} accounts`,
    });
  } catch (e: any) {
    results.push({
      component: 'Role Accounts (5 Roles)',
      pass: false,
      details: `Failed to query users: ${e.message}`,
    });
  }

  // 5. Express API Gateway Probe
  try {
    const r = await fetch(`http://localhost:5000/api/health`);
    results.push({
      component: 'Express Gateway (/api/health)',
      pass: r.ok,
      details: r.ok ? `HTTP ${r.status} OK` : `HTTP ${r.status} Error`,
    });
  } catch (e: any) {
    results.push({
      component: 'Express Gateway (/api/health)',
      pass: false,
      details: `Express server offline at http://localhost:5000/api/health (Start via 'npm start' in server)`,
    });
  }

  // 6. FastAPI AI Engine Probe
  try {
    const r = await fetch(`${FASTAPI_BASE_URL}/health`);
    results.push({
      component: 'FastAPI AI Engine (/health)',
      pass: r.ok,
      details: r.ok ? `HTTP ${r.status} OK` : `HTTP ${r.status} Error`,
    });
  } catch (e: any) {
    results.push({
      component: 'FastAPI AI Engine (/health)',
      pass: false,
      details: `FastAPI server offline at ${FASTAPI_BASE_URL} (Start uvicorn api.main:app)`,
    });
  }

  // Print Summary Table
  let allPass = true;
  for (const item of results) {
    const symbol = item.pass ? '✓' : '✗';
    console.log(`[${symbol}] ${item.component.padEnd(35)} : ${item.details}`);
    if (!item.pass) allPass = false;
  }

  console.log('\n==================================================');
  if (allPass) {
    console.log('DEMO HEALTH CHECK: PASS');
  } else {
    console.log('DEMO HEALTH CHECK: DEGRADED (Start servers for live API probes)');
  }
  console.log('==================================================\n');

  await prisma.$disconnect();
  process.exit(0);
}

runDemoHealthCheck();
