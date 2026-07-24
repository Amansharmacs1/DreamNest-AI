import { streamText } from 'ai';
import { google } from '@ai-sdk/google';

async function test() {
  const result = await streamText({
    model: google('gemini-2.5-flash'),
    prompt: 'Hello',
  });
  console.log('--- result keys ---');
  console.log(Object.keys(result));
  console.log("pipeDataStreamToResponse in result?", 'pipeDataStreamToResponse' in result);
  console.log("toDataStreamResponse in result?", 'toDataStreamResponse' in result);
}
test().catch(console.error);
