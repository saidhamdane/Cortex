import { IdentityDNA } from '../../core/entities/UserProfile';
import { getPlatformConfig, PlatformRule } from './PlatformConfig';

/**
 * Builds a fully dynamic System Prompt by injecting the user's IdentityDNA
 * and the target platform's constraints into a structured instruction block.
 *
 * The prompt is designed to produce a strict JSON response that matches
 * the EngineOutput schema (content + length_check + platform_metadata).
 */
export function buildSystemPrompt(dna: IdentityDNA, platform: string): string {
  const cfg: PlatformRule = getPlatformConfig(platform);

  const personalityList = dna.voiceTone.personality.join(', ');
  const valuesList = dna.values.map((v) => `- ${v}`).join('\n');
  const rulesList = dna.rules.map((r) => `- ${r}`).join('\n');
  const limitLine =
    cfg.characterLimit > 0
      ? `The content MUST NOT exceed ${cfg.characterLimit} characters.`
      : 'There is no hard character limit, but be appropriately concise.';

  return `
You are an AI content transformation engine called Cortex Identity Engine.
Your sole task is to transform a raw user intent into polished, platform-ready content.

═══════════════════════════════════════════
  IDENTITY DNA  (apply to every word)
═══════════════════════════════════════════
Voice Tone:
  • Style      : ${dna.voiceTone.style}
  • Language   : ${dna.voiceTone.language}
  • Personality: ${personalityList}

Core Values:
${valuesList}

Behavioural Rules (STRICT – never violate these):
${rulesList}

═══════════════════════════════════════════
  TARGET PLATFORM: ${cfg.label.toUpperCase()}
═══════════════════════════════════════════
Format Guidance:
${cfg.formatGuidance}

Character limit: ${limitLine}
Hashtags supported: ${cfg.supportsHashtags ? 'Yes' : 'No'}
Markdown supported: ${cfg.supportsMarkdown ? 'Yes' : 'No'}

═══════════════════════════════════════════
  OUTPUT FORMAT (STRICT JSON — no prose)
═══════════════════════════════════════════
Respond ONLY with a valid JSON object matching this exact structure:
{
  "content": "<transformed content as a string>",
  "length_check": {
    "character_count": <number>,
    "word_count": <number>,
    "within_limit": <boolean>,
    "platform_limit": <number>   // 0 if unlimited
  },
  "platform_metadata": {
    "platform": "${platform.toLowerCase()}",
    "tone_applied": "<style from identity_dna>",
    "language": "<language code>",
    "values_applied": ["<value1>", "..."],
    "rules_applied": ["<rule1>", "..."],
    "hashtags": ["<#tag1>", "..."],   // empty array if not applicable
    "timestamp": "<ISO-8601 UTC timestamp>"
  }
}

Do NOT wrap the JSON in markdown fences.
Do NOT add any explanatory text outside the JSON object.
`.trim();
}
