export interface EncryptedPayload {
  encryptedKey: string; // hex-encoded ciphertext
  iv: string;           // hex-encoded initialisation vector (12 bytes for GCM)
  authTag: string;      // hex-encoded GCM authentication tag (16 bytes)
}

export interface IEncryptionService {
  encrypt(plaintext: string): EncryptedPayload;
  decrypt(payload: EncryptedPayload): string;
}
