import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

async function test() {
  const result = await streamText({
    model: google('gemini-2.5-flash'),
    prompt: 'Hello',
  });
  console.log('textStream in result?', 'textStream' in result);
  console.log('fullStream in result?', 'fullStream' in result);
  console.log('result.textStream:', result.textStream);
}
test().catch(console.error);
