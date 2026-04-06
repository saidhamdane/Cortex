import { EngineOutput } from '../entities/EngineOutput';
import { IdentityDNA } from '../entities/UserProfile';

export interface TransformContext {
  rawIntent: string;
  platform: string;
  identityDNA: IdentityDNA;
  /** Decrypted API key for the platform, if available in the user's credentials */
  platformApiKey?: string;
}

export interface IIdentityEngine {
  /**
   * Transforms a raw user intent into platform-adapted content,
   * shaped entirely by the user's IdentityDNA.
   */
  transformIntent(context: TransformContext): Promise<EngineOutput>;
}
