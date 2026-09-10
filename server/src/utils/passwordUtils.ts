import argon2 from 'argon2';
import bcrypt from 'bcryptjs';

/**
 * Hashes a plaintext password using Argon2id.
 * Memory: 64MB (65536 KB), Time iterations: 3, Parallelism: 4
 */
export async function hashPassword(password: string): Promise<string> {
  const hashResult = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
  return String(hashResult);
}

/**
 * Verifies a plaintext password against a stored hash (Argon2id or legacy bcrypt).
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false;

  if (storedHash.startsWith('$argon2')) {
    try {
      return await argon2.verify(storedHash, password);
    } catch {
      return false;
    }
  }

  if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
    try {
      return await bcrypt.compare(password, storedHash);
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Returns true if the stored hash is a legacy hash (e.g. bcrypt) that needs upgrading to Argon2id.
 */
export function needsArgon2Rehash(storedHash: string): boolean {
  if (!storedHash) return false;
  return !storedHash.startsWith('$argon2');
}
