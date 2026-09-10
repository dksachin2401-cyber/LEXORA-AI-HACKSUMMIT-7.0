import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load server/.env
const envPath = path.join(process.cwd(), 'server', '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

console.log('==================================================');
console.log('LEXORA Production Configuration Pre-Flight Validator');
console.log('==================================================\n');

interface ConfigCheck {
  name: string;
  pass: boolean;
  explanation: string;
}

const checks: ConfigCheck[] = [];

// 1. NODE_ENV Check
const nodeEnv = process.env.NODE_ENV;
checks.push({
  name: 'NODE_ENV Configuration',
  pass: nodeEnv === 'production',
  explanation: nodeEnv === 'production' ? 'Set to production' : `Current value is '${nodeEnv || 'unset'}' (expected 'production')`,
});

// 2. CLIENT_URL Check
const clientUrl = process.env.CLIENT_URL;
checks.push({
  name: 'CLIENT_URL Origin Validation',
  pass: Boolean(clientUrl && clientUrl.startsWith('http')),
  explanation: clientUrl ? `Valid origin '${clientUrl}'` : 'CLIENT_URL environment variable is missing',
});

// 3. JWT_SECRET Check
const jwtSecret = process.env.JWT_SECRET;
const defaultJwtSecrets = ['your_secure_random_jwt_secret_here_2026', 'secret', 'change_me', 'lexora_judicial_intelligence_secret_key_2026_supreme'];
const isJwtDefault = jwtSecret ? defaultJwtSecrets.includes(jwtSecret) : false;
checks.push({
  name: 'JWT_SECRET Cryptographic Strength',
  pass: Boolean(jwtSecret && jwtSecret.length >= 32 && !isJwtDefault),
  explanation: isJwtDefault
    ? 'Insecure development default JWT_SECRET detected!'
    : jwtSecret && jwtSecret.length >= 32
    ? 'Sufficient secret length (>= 32 chars)'
    : 'JWT_SECRET missing or too short (< 32 chars)',
});

// 4. ENCRYPTION_KEY Check
const encryptionKey = process.env.ENCRYPTION_KEY;
const isEncryptionKeyDefault = encryptionKey ? ['lexora_production_grade_32byte_secret_encryption_key_2026_secure!'].includes(encryptionKey) : false;
checks.push({
  name: 'ENCRYPTION_KEY Secret Independence',
  pass: Boolean(encryptionKey && encryptionKey.length >= 32 && encryptionKey !== jwtSecret && !isEncryptionKeyDefault),
  explanation: isEncryptionKeyDefault
    ? 'Insecure default ENCRYPTION_KEY detected!'
    : encryptionKey === jwtSecret
    ? 'ENCRYPTION_KEY reuses JWT_SECRET — must be independent!'
    : encryptionKey && encryptionKey.length >= 32
    ? 'Valid independent encryption key'
    : 'ENCRYPTION_KEY missing or too short',
});

// 5. INTERNAL_API_KEY Check
const internalKey = process.env.INTERNAL_API_KEY;
const isInternalDefault = internalKey ? internalKey === 'lexora_internal_api_secret_key_2026' : false;
checks.push({
  name: 'INTERNAL_API_KEY Inter-Service Auth Key',
  pass: Boolean(internalKey && internalKey.length >= 24 && !isInternalDefault),
  explanation: isInternalDefault
    ? 'Development default INTERNAL_API_KEY detected!'
    : internalKey && internalKey.length >= 24
    ? 'Valid internal service key'
    : 'INTERNAL_API_KEY missing or too short (< 24 chars)',
});

// 6. BACKUP_ENCRYPTION_KEY Check
const backupKey = process.env.BACKUP_ENCRYPTION_KEY;
checks.push({
  name: 'BACKUP_ENCRYPTION_KEY Dedicated Key',
  pass: Boolean(backupKey && backupKey.length >= 32 && backupKey !== encryptionKey),
  explanation: backupKey && backupKey !== encryptionKey
    ? 'Dedicated backup key configured'
    : backupKey === encryptionKey
    ? 'BACKUP_ENCRYPTION_KEY reuses ENCRYPTION_KEY — must be separate!'
    : 'BACKUP_ENCRYPTION_KEY missing or too short',
});

// 7. VITE Frontend Variable Inspection
const rawEnv = process.env;
const exposedViteSecrets = Object.keys(rawEnv).filter(
  (k) => k.startsWith('VITE_') && (k.includes('SECRET') || k.includes('KEY') || k.includes('PASS') || k.includes('INTERNAL'))
);
checks.push({
  name: 'Frontend VITE_* Secret Hygiene',
  pass: exposedViteSecrets.length === 0,
  explanation: exposedViteSecrets.length === 0
    ? 'No secrets exposed in VITE_* environment variables'
    : `Exposed secret variables detected in VITE_*: ${exposedViteSecrets.join(', ')}`,
});

// Print Results
let allPass = true;
for (const check of checks) {
  const symbol = check.pass ? '✓' : '✗';
  console.log(`[${symbol}] ${check.name}`);
  console.log(`    Detail: ${check.explanation}`);
  if (!check.pass) allPass = false;
}

console.log('\n==================================================');
if (allPass) {
  console.log('PRODUCTION CONFIGURATION: PASS');
  process.exit(0);
} else {
  console.log('PRODUCTION CONFIGURATION: FAIL');
  process.exit(1);
}
