import { OpenAIStream } from '@/utils/OpenAIStream';
import GPT3Tokenizer from 'gpt3-tokenizer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI');
}

export const config = {
  runtime: 'edge',
};

const tokenManager = (text, maxTokens = 3000) => {
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
  const encoded = tokenizer.encode(text);

  let truncatedText = '';
  let tokenCount = 0;

  if (encoded.bpe.length > maxTokens) {
    const decoded = tokenizer.decode(encoded.bpe.slice(0, maxTokens));
    truncatedText = decoded;
    tokenCount = maxTokens;
  } else {
    truncatedText = text;
    tokenCount = encoded.bpe.length;
  }

  return [truncatedText, tokenCount];
};

const handler = async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('req.method ', req.method);
    return new Response('ok', { headers: corsHeaders });
  }

  const data = await req.json();

  const title = data.title;
  const description = data.description;
  const transcript = data.transcript;

  if (!transcript) {
    return new Response('No transcript in the request', { status: 400 });
  }

  const query = transcript;

  // OpenAI recommends replacing newlines with spaces for best results
  const input = query.replace(/\n/g, ' ');

  const [truncatedText, tokenCount] = tokenManager(input);
  console.log('tokensNeeded: ', tokenCount);
  // console.log('truncatedText: ', truncatedText);

  const systemContent = `Create summary of Youtube video in 100 words based on the title, description and transcript provided in the user message context.`;

  const userMessage = `CONTEXT:
  TITLE: ${title}
  DESCRIPTION: ${description}
  TRANSCRIPT: ${truncatedText}
  
  USER QUESTION: Summarize this Youtube video in 200 words in a fun and interesting way.
  `;

  console.log('userMessage: ', userMessage);

  const messages = [
    {
      role: 'system',
      content: systemContent,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 0.2,
    max_tokens: 300,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
