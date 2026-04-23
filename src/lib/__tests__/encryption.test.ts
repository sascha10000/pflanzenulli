import { describe, expect, it, beforeAll } from "vitest";
import { encryptAddress, decryptAddress } from "../encryption";

describe("address encryption", () => {
  beforeAll(() => {
    process.env.AUTH_SECRET = "test-secret-key-for-encryption-tests";
  });

  it("encrypts and decrypts an address", () => {
    const address = "Musterstraße 12, 10115 Berlin, Germany";
    const transactionId = "test-transaction-123";

    const encrypted = encryptAddress(address, transactionId);
    const decrypted = decryptAddress(encrypted, transactionId);

    expect(decrypted).toBe(address);
  });

  it("produces different ciphertext for different transaction IDs", () => {
    const address = "Musterstraße 12, 10115 Berlin, Germany";

    const enc1 = encryptAddress(address, "tx-1");
    const enc2 = encryptAddress(address, "tx-2");

    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
  });

  it("produces different IVs for same input", () => {
    const address = "Same address";
    const txId = "same-tx";

    const enc1 = encryptAddress(address, txId);
    const enc2 = encryptAddress(address, txId);

    expect(enc1.iv).not.toBe(enc2.iv);
  });

  it("fails to decrypt with wrong transaction ID", () => {
    const encrypted = encryptAddress("secret address", "tx-correct");

    expect(() => decryptAddress(encrypted, "tx-wrong")).toThrow();
  });
});
