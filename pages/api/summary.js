import { OpenAIStream } from '@/utils/OpenAIStream';
import GPT3Tokenizer from 'gpt3-tokenizer';
import { getSubtitles } from 'youtube-caption-extractor';

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

async function getVideoInfo(videoID, apiKey) {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoID}&key=${apiKey}`
  );

  const data = await response.json();
  const video = data.items[0];
  const snippet = video.snippet;

  return {
    title: snippet.title,
    description: snippet.description,
    channelId: snippet.channelId,
    channelTitle: snippet.channelTitle,
    thumbnailUrl: snippet.thumbnails.default.url,
  };
}

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

  // const data = await req.json();
  const url = new URL(req.url);
  const videoId = url.searchParams.get('videoId');

  const selectedCount = url.searchParams.get('count');

  console.log('videoId: ', videoId);
  console.log('selectedCount: ', selectedCount);

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!videoId) {
    return new Response(
      JSON.stringify({ error: 'Missing videoID query parameter' }),
      { status: 400 }
    );
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing YouTube API key' }), {
      status: 500,
    });
  }

  try {
    const captions = await getSubtitles({ videoID: videoId });

    const transcript = captions
      .map((caption) => caption.text.replace(/\n/g, ' ').trim())
      .filter((text) => text)
      .join(', ');

    // console.log('transcript: ', transcript);

    const videoInfo = await getVideoInfo(videoId, apiKey);
    const title = videoInfo.title;
    const description = videoInfo.description;

    console.log('title: ', title);
    console.log('description: ', description);

    // if (!transcript) {
    //   return new Response('No transcript in the request', { status: 400 });
    // }

    // OpenAI recommends replacing newlines with spaces for best results
    const queryTranscript = transcript.replace(/\n/g, ' ');

    const [truncatedTranscript, transcriptTokenCount] =
      tokenManager(queryTranscript);
    console.log('transcriptTokenCount: ', transcriptTokenCount);
    console.log('truncatedTranscript: ', truncatedTranscript);

    const queryDescription = description.replace(/\n/g, ' ');
    const [truncatedDescription, descriptionTokenCount] = tokenManager(
      queryDescription,
      300
    );

    console.log('descriptionTokenCount: ', descriptionTokenCount);
    console.log('truncatedDescription: ', truncatedDescription);

    const systemContent = `Create summary of Youtube video based on the title, description and transcript provided in the user message context.`;

    const userMessage = `CONTEXT:
    TITLE: ${title}
    DESCRIPTION: ${truncatedDescription}
    TRANSCRIPT: ${truncatedTranscript}
    
    USER QUESTION: Please use your AI magic to create a fun, interesting, and easy-to-understand summary in ${selectedCount} of this YouTube video. 
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
      max_tokens: 500,
      stream: true,
      n: 1,
    };

    const stream = await OpenAIStream(payload);
    return new Response(stream);
  } catch (error) {
    console.error('Failed to fetch captions:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch captions' }), {
      status: 500,
    });
  }
};

export default handler;
