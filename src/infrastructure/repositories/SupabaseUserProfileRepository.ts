import { SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, IdentityDNA, EncryptedCredential } from '../../core/entities/UserProfile';
import { IUserProfileRepository } from '../../core/interfaces/IUserProfileRepository';

const TABLE = 'user_profiles';

export class SupabaseUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`findById failed: ${error.message}`);
    return data ?? null;
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const { data, error } = await this.db
      .from(TABLE)
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw new Error(`findByEmail failed: ${error.message}`);
    return data ?? null;
  }

  async create(profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile> {
    const { data, error } = await this.db
      .from(TABLE)
      .insert(profile)
      .select()
      .single();

    if (error) throw new Error(`create failed: ${error.message}`);
    return data;
  }

  async updateIdentityDNA(userId: string, dna: Partial<IdentityDNA>): Promise<UserProfile> {
    const { data, error } = await this.db
      .from(TABLE)
      .update({ identity_dna: dna, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(`updateIdentityDNA failed: ${error.message}`);
    return data;
  }

  async updateCredentials(
    userId: string,
    credentials: EncryptedCredential[],
  ): Promise<UserProfile> {
    const { data, error } = await this.db
      .from(TABLE)
      .update({
        encrypted_credentials: credentials,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw new Error(`updateCredentials failed: ${error.message}`);
    return data;
  }

  async delete(userId: string): Promise<void> {
    const { error } = await this.db.from(TABLE).delete().eq('id', userId);
    if (error) throw new Error(`delete failed: ${error.message}`);
  }
}
