import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';

import { IIdentityEngine, TransformContext } from '../../core/interfaces/IIdentityEngine';
import { EngineOutput, EngineOutputSchema } from '../../core/entities/EngineOutput';
import { getPlatformConfig } from './PlatformConfig';
import { buildSystemPrompt } from './PromptBuilder';

export class IdentityEngine implements IIdentityEngine {
  private readonly model: ChatOpenAI;

  constructor(apiKey: string, modelName = 'gpt-4o-mini') {
    if (!apiKey) {
      throw new Error('OpenAI API key is required to initialise IdentityEngine.');
    }
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName,
      temperature: 0.7,
      maxTokens: 2048,
    });
  }

  async transformIntent(context: TransformContext): Promise<EngineOutput> {
    const { rawIntent, platform, identityDNA } = context;

    // 1. Build structured output parser from Zod schema
    const parser = StructuredOutputParser.fromZodSchema(EngineOutputSchema);

    // 2. Build dynamic system prompt from identity DNA
    const systemPrompt = buildSystemPrompt(identityDNA, platform);

    // 3. Build the platform context hint for the human turn
    const platformCfg = getPlatformConfig(platform);
    const humanMessage = this.buildHumanMessage(rawIntent, platform, platformCfg.characterLimit);

    // 4. Assemble LangChain prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate('{system_prompt}'),
      HumanMessagePromptTemplate.fromTemplate('{human_message}'),
    ]);

    // 5. Build and invoke the chain: prompt → model → parser
    const chain = prompt.pipe(this.model).pipe(parser);

    const result = await chain.invoke({
      system_prompt: systemPrompt,
      human_message: humanMessage,
    });

    // 6. Post-process: recalculate length_check to guarantee accuracy
    return this.reconcileLengthCheck(result, platformCfg.characterLimit);
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private buildHumanMessage(
    rawIntent: string,
    platform: string,
    charLimit: number,
  ): string {
    const limitHint =
      charLimit > 0
        ? `Remember: output content must be ≤ ${charLimit} characters.`
        : 'No character limit applies.';

    return (
      `Transform the following intent for the "${platform}" platform.\n\n` +
      `INTENT:\n${rawIntent}\n\n` +
      `${limitHint}\n\n` +
      `Respond with the strict JSON object described in your instructions.`
    );
  }

  /**
   * Recomputes character_count, word_count, and within_limit from the actual
   * content string so the numbers are always accurate regardless of what the
   * LLM returned.
   */
  private reconcileLengthCheck(output: EngineOutput, platformLimit: number): EngineOutput {
    const charCount = output.content.length;
    const wordCount = output.content.trim().split(/\s+/).filter(Boolean).length;
    const withinLimit = platformLimit === 0 ? true : charCount <= platformLimit;

    return {
      ...output,
      length_check: {
        character_count: charCount,
        word_count: wordCount,
        within_limit: withinLimit,
        platform_limit: platformLimit,
      },
    };
  }
}
