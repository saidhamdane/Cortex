import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { IEncryptionService, EncryptedPayload } from '../../core/interfaces/IEncryptionService';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;    // 96-bit IV — recommended for GCM
const TAG_LENGTH = 16;   // 128-bit authentication tag

export class AesEncryptionService implements IEncryptionService {
  private readonly key: Buffer;

  constructor(hexKey: string) {
    const keyBuffer = Buffer.from(hexKey, 'hex');
    if (keyBuffer.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be a 32-byte (64-character) hex string.');
    }
    this.key = keyBuffer;
  }

  encrypt(plaintext: string): EncryptedPayload {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv, { authTagLength: TAG_LENGTH });

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    return {
      encryptedKey: encrypted.toString('hex'),
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
    };
  }

  decrypt(payload: EncryptedPayload): string {
    const decipher = createDecipheriv(
      ALGORITHM,
      this.key,
      Buffer.from(payload.iv, 'hex'),
      { authTagLength: TAG_LENGTH },
    );

    decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(payload.encryptedKey, 'hex')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}
