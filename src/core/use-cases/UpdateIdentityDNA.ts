import { UserProfile, UpdateIdentityDNADTO } from '../entities/UserProfile';
import { IUserProfileRepository } from '../interfaces/IUserProfileRepository';

export class UpdateIdentityDNA {
  constructor(private readonly repository: IUserProfileRepository) {}

  async execute(dto: UpdateIdentityDNADTO): Promise<UserProfile> {
    const profile = await this.repository.findById(dto.userId);
    if (!profile) {
      throw new Error(`User profile "${dto.userId}" not found.`);
    }

    // Deep-merge incoming fields with the existing DNA
    const merged = {
      voiceTone: { ...profile.identity_dna.voiceTone, ...dto.identity_dna.voiceTone },
      values: dto.identity_dna.values ?? profile.identity_dna.values,
      rules: dto.identity_dna.rules ?? profile.identity_dna.rules,
      customFields: {
        ...profile.identity_dna.customFields,
        ...dto.identity_dna.customFields,
      },
    };

    return this.repository.updateIdentityDNA(dto.userId, merged);
  }
}
