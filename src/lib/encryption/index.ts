import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Derive a per-transaction encryption key from the master key + transaction ID.
 * Uses HKDF (HMAC-based Key Derivation Function) for secure key derivation.
 */
function deriveKey(transactionId: string): Buffer {
  const masterKey = process.env.AUTH_SECRET;
  if (!masterKey) {
    throw new Error("AUTH_SECRET environment variable is required for encryption");
  }

  return Buffer.from(
    hkdfSync("sha256", masterKey, transactionId, "address-exchange", 32),
  );
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

export function encryptAddress(
  plaintext: string,
  transactionId: string,
): EncryptedData {
  const key = deriveKey(transactionId);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  return {
    ciphertext: encrypted,
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptAddress(
  data: EncryptedData,
  transactionId: string,
): string {
  const key = deriveKey(transactionId);
  const iv = Buffer.from(data.iv, "base64");
  const authTag = Buffer.from(data.authTag, "base64");
  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(data.ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
