import { encryptBuffer, decryptBuffer } from './cryptoUtils.js';

const FIELD_ENC_PREFIX = 'ENC_V1:';

/**
 * Encrypts a sensitive database field value using AES-256-GCM.
 * Formats payload as `ENC_V1:<base64-encoded encryptedBuffer>`.
 * Idempotent: does not double-encrypt already encrypted string values.
 */
export function encryptField(text: string | null | undefined): string | null | undefined {
  if (text === null || text === undefined || text === '') {
    return text;
  }

  if (typeof text === 'string' && text.startsWith(FIELD_ENC_PREFIX)) {
    return text; // Already encrypted - prevent double encryption
  }

  const plainBuffer = Buffer.from(text, 'utf-8');
  const encryptedBuffer = encryptBuffer(plainBuffer);
  const base64Encrypted = encryptedBuffer.toString('base64');

  return `${FIELD_ENC_PREFIX}${base64Encrypted}`;
}

/**
 * Decrypts an encrypted database field value.
 * If input is legacy plaintext (does not start with `ENC_V1:`), returns the plaintext verbatim (seamless migration).
 */
export function decryptField(text: string | null | undefined): string | null | undefined {
  if (text === null || text === undefined || text === '') {
    return text;
  }

  if (typeof text !== 'string' || !text.startsWith(FIELD_ENC_PREFIX)) {
    return text; // Legacy plaintext - return verbatim
  }

  const base64Payload = text.slice(FIELD_ENC_PREFIX.length);
  const encryptedBuffer = Buffer.from(base64Payload, 'base64');
  const decryptedBuffer = decryptBuffer(encryptedBuffer);

  return decryptedBuffer.toString('utf-8');
}
