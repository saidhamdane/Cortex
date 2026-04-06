import { UserProfile, EncryptedCredential, IdentityDNA } from '../entities/UserProfile';

export interface IUserProfileRepository {
  findById(id: string): Promise<UserProfile | null>;
  findByEmail(email: string): Promise<UserProfile | null>;
  create(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile>;
  updateIdentityDNA(userId: string, dna: Partial<IdentityDNA>): Promise<UserProfile>;
  updateCredentials(userId: string, credentials: EncryptedCredential[]): Promise<UserProfile>;
  delete(userId: string): Promise<void>;
}
