import { v4 as uuidv4 } from 'uuid';
import { UserProfile, CreateUserProfileDTO, EncryptedCredential } from '../entities/UserProfile';
import { IUserProfileRepository } from '../interfaces/IUserProfileRepository';
import { IEncryptionService } from '../interfaces/IEncryptionService';

export class CreateUserProfile {
  constructor(
    private readonly repository: IUserProfileRepository,
    private readonly encryption: IEncryptionService,
  ) {}

  async execute(dto: CreateUserProfileDTO): Promise<UserProfile> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new Error(`A profile with email "${dto.email}" already exists.`);
    }

    const encryptedCredentials: EncryptedCredential[] = (dto.rawCredentials ?? []).map(
      ({ platform, apiKey }) => ({
        platform,
        ...this.encryption.encrypt(apiKey),
      }),
    );

    const profile: Omit<UserProfile, 'created_at' | 'updated_at'> = {
      id: uuidv4(),
      email: dto.email,
      identity_dna: dto.identity_dna,
      encrypted_credentials: encryptedCredentials,
    };

    return this.repository.create(profile);
  }
}
