import crypto from 'crypto';
import { config } from '../../config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a string formatted as base64(iv):base64(authTag):base64(encryptedContent)
 */
export function encrypt(text: string): string {
  const key = config.encryption.key;
  if (!key) {
    if (config.server.isProd) {
      throw new Error('ENCRYPTION_KEY is not set in production');
    }
    // Fallback for development if key is missing
    return text; 
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const validKey = crypto.createHash('sha256').update(key).digest();
  const cipher = crypto.createCipheriv(ALGORITHM, validKey, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag().toString('base64');
  
  return `${iv.toString('base64')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string encrypted with encrypt().
 */
export function decrypt(encryptedText: string): string {
  const key = config.encryption.key;
  if (!key) {
    if (config.server.isProd) {
      throw new Error('ENCRYPTION_KEY is not set in production');
    }
    return encryptedText;
  }

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    // If not encrypted, return as is (fallback for legacy data)
    return encryptedText;
  }

  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');
  const content = parts[2];

  const validKey = crypto.createHash('sha256').update(key).digest();
  const decipher = crypto.createDecipheriv(ALGORITHM, validKey, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(content, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Creates a deterministic SHA-256 hash for searching/indexing.
 */
export function hash(text: string): string {
  return crypto.createHash('sha256').update(text.toLowerCase()).digest('hex');
}
