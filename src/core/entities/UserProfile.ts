export interface IdentityDNA {
  voiceTone: {
    style: string;          // e.g. "formal" | "casual" | "technical"
    language: string;       // e.g. "ar" | "en"
    personality: string[];  // e.g. ["empathetic", "direct", "analytical"]
  };
  values: string[];         // e.g. ["privacy", "transparency", "efficiency"]
  rules: string[];          // e.g. ["never share PII", "always cite sources"]
  customFields?: Record<string, unknown>;
}

export interface EncryptedCredential {
  platform: string;         // e.g. "openai" | "twitter" | "notion"
  encryptedKey: string;     // AES-256-GCM ciphertext (hex)
  iv: string;               // Initialisation vector (hex)
  authTag: string;          // GCM authentication tag (hex)
}

export interface UserProfile {
  id: string;               // UUID
  email: string;
  identity_dna: IdentityDNA;
  encrypted_credentials: EncryptedCredential[];
  created_at?: string;
  updated_at?: string;
}

export type CreateUserProfileDTO = Pick<UserProfile, 'email' | 'identity_dna'> & {
  rawCredentials?: Array<{ platform: string; apiKey: string }>;
};

export type UpdateIdentityDNADTO = {
  userId: string;
  identity_dna: Partial<IdentityDNA>;
};

export type AddCredentialDTO = {
  userId: string;
  platform: string;
  apiKey: string;
};
