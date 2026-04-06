import { UserProfile, AddCredentialDTO, EncryptedCredential } from '../entities/UserProfile';
import { IUserProfileRepository } from '../interfaces/IUserProfileRepository';
import { IEncryptionService } from '../interfaces/IEncryptionService';

export class ManageCredentials {
  constructor(
    private readonly repository: IUserProfileRepository,
    private readonly encryption: IEncryptionService,
  ) {}

  async addOrUpdate(dto: AddCredentialDTO): Promise<UserProfile> {
    const profile = await this.repository.findById(dto.userId);
    if (!profile) {
      throw new Error(`User profile "${dto.userId}" not found.`);
    }

    const encrypted: EncryptedCredential = {
      platform: dto.platform,
      ...this.encryption.encrypt(dto.apiKey),
    };

    // Replace existing credential for the same platform, or append
    const existing = profile.encrypted_credentials.filter(
      (c) => c.platform !== dto.platform,
    );
    const updated = [...existing, encrypted];

    return this.repository.updateCredentials(dto.userId, updated);
  }

  async remove(userId: string, platform: string): Promise<UserProfile> {
    const profile = await this.repository.findById(userId);
    if (!profile) {
      throw new Error(`User profile "${userId}" not found.`);
    }

    const updated = profile.encrypted_credentials.filter(
      (c) => c.platform !== platform,
    );

    return this.repository.updateCredentials(userId, updated);
  }

  /** Decrypts and returns the raw API key for a given platform. */
  getDecryptedKey(profile: UserProfile, platform: string): string {
    const credential = profile.encrypted_credentials.find(
      (c) => c.platform === platform,
    );
    if (!credential) {
      throw new Error(`No credential found for platform "${platform}".`);
    }
    return this.encryption.decrypt(credential);
  }
}
