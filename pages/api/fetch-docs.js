import { supabaseClient } from '@/lib/Supabase';
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

const handler = async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('req.method ', req.method);
    return new Response('ok', { headers: corsHeaders });
  }

  const data = await req.json();
  const question = data.question;

  console.log('question: ', question);

  //   if (!question) {
  //     return new Response('No prompt in the request', { status: 400 });
  //   }

  const query = question;

  // OpenAI recommends replacing newlines with spaces for best results
  const input = query.replace(/\n/g, ' ');
  // console.log("input: ", input);

  const apiKey = process.env.OPENAI_API_KEY;

  const embeddingResponse = await fetch(
    'https://api.openai.com/v1/embeddings',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input,
        model: 'text-embedding-ada-002',
      }),
    }
  );

  const embeddingData = await embeddingResponse.json();
  const [{ embedding }] = embeddingData.data;
  //   console.log('embedding: ', embedding);

  const { data: documents, error } = await supabaseClient.rpc(
    'match_documents',
    {
      query_embedding: embedding,
      similarity_threshold: 0.7, // Choose an appropriate threshold for your data
      match_count: 3, // Choose the number of matches
    }
  );

  if (error) console.error(error);

  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
  let tokenCount = 0;
  let contextText = '';

  console.log('documents: ', documents);

  // Concat matched documents
  if (documents) {
    for (let i = 0; i < documents.length; i++) {
      console.log('document: ', i);
      const document = documents[i];
      const content = document.content;
      const url = document.url;
      const encoded = tokenizer.encode(content);

      console.log('encoded: ', i, encoded.text.length);
      tokenCount += encoded.text.length;

      // Limit context to max 1500 tokens (configurable)
      if (tokenCount > 1500) {
        break;
      }

      contextText += `${content.trim()}\nSOURCE: ${url}\n---\n`;
    }
  }

  console.log('contextText: ', contextText);

  const systemContent = `Create summary of youtube video in 100 words and answer user questions based on the title, description and transcript of the video. If you are unsure and the answer is not provided in the CONTEXT, you say, "Sorry, I don't know how to help with that."`;

  const userMessage = `CONTEXT:
  ${contextText}
  
  USER QUESTION: 
  ${
    query !== '' ? query : 'Summarize this youtube video trascript in 100 words'
  }  
  `;

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

  console.log('messages: ', messages);

  const payload = {
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 0.2,
    stream: true,
    n: 1,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
