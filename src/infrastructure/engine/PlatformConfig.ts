export interface PlatformRule {
  /** Human-readable platform name */
  label: string;
  /** Hard character limit (0 = unlimited) */
  characterLimit: number;
  /** Whether hashtags are conventional on this platform */
  supportsHashtags: boolean;
  /** Whether markdown/rich text is rendered */
  supportsMarkdown: boolean;
  /** Suggested content format guidance injected into the prompt */
  formatGuidance: string;
}

const PLATFORMS: Record<string, PlatformRule> = {
  twitter: {
    label: 'Twitter / X',
    characterLimit: 280,
    supportsHashtags: true,
    supportsMarkdown: false,
    formatGuidance:
      'Write a concise, punchy tweet. Maximum 280 characters. ' +
      'Include 1-3 relevant hashtags at the end. No markdown.',
  },
  linkedin: {
    label: 'LinkedIn',
    characterLimit: 3000,
    supportsHashtags: true,
    supportsMarkdown: false,
    formatGuidance:
      'Write a professional LinkedIn post. Use short paragraphs. ' +
      'Add a clear call-to-action. Include 3-5 hashtags at the end.',
  },
  notion: {
    label: 'Notion',
    characterLimit: 0,
    supportsHashtags: false,
    supportsMarkdown: true,
    formatGuidance:
      'Write a well-structured Notion document section. ' +
      'Use markdown headings (##, ###), bullet lists, and bold for emphasis. ' +
      'No hashtags needed.',
  },
  instagram: {
    label: 'Instagram',
    characterLimit: 2200,
    supportsHashtags: true,
    supportsMarkdown: false,
    formatGuidance:
      'Write an engaging Instagram caption. Use a hook in the first line. ' +
      'Add a call-to-action. Include 5-10 hashtags separated by newlines at the end.',
  },
  email: {
    label: 'Email',
    characterLimit: 0,
    supportsHashtags: false,
    supportsMarkdown: false,
    formatGuidance:
      'Write a professional email body. Include a clear subject line prefixed with "Subject: ". ' +
      'Use greeting and sign-off. Keep paragraphs short.',
  },
  blog: {
    label: 'Blog / Article',
    characterLimit: 0,
    supportsHashtags: false,
    supportsMarkdown: true,
    formatGuidance:
      'Write a complete blog article section with markdown. ' +
      'Use ## for section headings, include an intro paragraph, ' +
      'body content, and a conclusion.',
  },
};

const DEFAULT_PLATFORM: PlatformRule = {
  label: 'Generic',
  characterLimit: 0,
  supportsHashtags: false,
  supportsMarkdown: false,
  formatGuidance: 'Write clear and well-structured content appropriate for the context.',
};

export function getPlatformConfig(platform: string): PlatformRule {
  return PLATFORMS[platform.toLowerCase()] ?? DEFAULT_PLATFORM;
}

export function getSupportedPlatforms(): string[] {
  return Object.keys(PLATFORMS);
}
