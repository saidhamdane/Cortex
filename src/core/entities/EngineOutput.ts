import { z } from 'zod';

// ── Zod schema — used by LangChain's structured output parser ──────────────

export const LengthCheckSchema = z.object({
  character_count: z.number().describe('Total characters in the generated content'),
  word_count: z.number().describe('Total words in the generated content'),
  within_limit: z.boolean().describe('Whether content is within the platform character limit'),
  platform_limit: z.number().describe('Maximum character limit for the target platform'),
});

export const PlatformMetadataSchema = z.object({
  platform: z.string().describe('Target platform identifier (e.g. twitter, linkedin, notion)'),
  tone_applied: z.string().describe('Voice tone style applied from identity_dna'),
  language: z.string().describe('Language code of the output (e.g. ar, en)'),
  values_applied: z.array(z.string()).describe('Values from identity_dna reflected in the output'),
  rules_applied: z.array(z.string()).describe('Rules from identity_dna that shaped the output'),
  hashtags: z.array(z.string()).describe('Suggested hashtags relevant to the platform (empty if N/A)'),
  timestamp: z.string().describe('ISO-8601 generation timestamp'),
});

export const EngineOutputSchema = z.object({
  content: z.string().describe('The fully transformed and platform-adapted content'),
  length_check: LengthCheckSchema,
  platform_metadata: PlatformMetadataSchema,
});

// ── TypeScript types inferred from the schemas ─────────────────────────────

export type LengthCheck = z.infer<typeof LengthCheckSchema>;
export type PlatformMetadata = z.infer<typeof PlatformMetadataSchema>;
export type EngineOutput = z.infer<typeof EngineOutputSchema>;

// ── Input DTO ──────────────────────────────────────────────────────────────

export interface TransformIntentDTO {
  userId: string;
  rawIntent: string;
  platform: string;
}
