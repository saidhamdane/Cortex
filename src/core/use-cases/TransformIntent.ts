import { EngineOutput, TransformIntentDTO } from '../entities/EngineOutput';
import { IUserProfileRepository } from '../interfaces/IUserProfileRepository';
import { IEncryptionService } from '../interfaces/IEncryptionService';
import { IIdentityEngine } from '../interfaces/IIdentityEngine';

export class TransformIntent {
  constructor(
    private readonly repository: IUserProfileRepository,
    private readonly encryption: IEncryptionService,
    private readonly engine: IIdentityEngine,
  ) {}

  async execute(dto: TransformIntentDTO): Promise<EngineOutput> {
    // 1. Load the user's full profile (DNA + encrypted credentials)
    const profile = await this.repository.findById(dto.userId);
    if (!profile) {
      throw new Error(`User profile "${dto.userId}" not found.`);
    }

    // 2. Optionally decrypt the platform-specific API key for context
    let platformApiKey: string | undefined;
    const credential = profile.encrypted_credentials.find(
      (c) => c.platform.toLowerCase() === dto.platform.toLowerCase(),
    );
    if (credential) {
      try {
        platformApiKey = this.encryption.decrypt(credential);
      } catch {
        // Non-fatal — engine proceeds without the key
      }
    }

    // 3. Delegate transformation to the Identity Engine
    return this.engine.transformIntent({
      rawIntent: dto.rawIntent,
      platform: dto.platform,
      identityDNA: profile.identity_dna,
      platformApiKey,
    });
  }
}
