import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';

export type AIProvider = 'openai' | 'gemini' | 'anthropic';

export const getAIModel = (provider: AIProvider) => {
  switch (provider) {
    case 'openai':
      return openai('gpt-4o');
    case 'gemini':
      return google('gemini-2.5-flash');
    case 'anthropic':
      return anthropic('claude-3-5-sonnet-latest');
    default:
      return google('gemini-2.5-flash');
  }
};
