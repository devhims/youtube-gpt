import { supabaseClient } from '@/lib/Supabase';
import count from 'word-count';
import { OpenAIStream } from '@/utils/OpenAIStream';
import GPT3Tokenizer from 'gpt3-tokenizer';
import { Configuration, OpenAIApi } from 'openai';
import { getSubtitles } from 'youtube-caption-extractor';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// character chunk size
const docSize = 5000;
// max number of characters allowed
const maxChars = 40000;
// max number of words allowed
const maxWords = 10000;

export default async function handle(req, res) {
  const { method, body } = req;

  if (method === 'POST') {
    const { videoID } = body;

    const url = `https://youtube.com/watch?v=${videoID}`;

    try {
      const captions = await getSubtitles({ videoID: videoID });

      const transcript = captions
        .map((caption) => caption.text.replace(/\n/g, ' ').trim())
        .filter((text) => text)
        .join(', ');

      const documents = await getDocument(transcript, url);

      if (documents.error) {
        return res
          .status(400)
          .json({ success: false, message: documents.error });
      }

      console.log('DOCUMENTS READY');

      await processDocuments(documents);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error in processing documents:', error);
      return res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  }

  return res
    .status(405)
    .json({ success: false, message: 'Method not allowed' });
}

async function processDocuments(documents) {
  for (const { url, body } of documents) {
    const input = body.replace(/\s+/g, ' ').trim();
    console.log('input', input);
    console.log('\nDocument length: \n', body.length);
    console.log('\nURL: \n', url);

    try {
      const embedding = await getEmbedding(input);
      console.log('EMBEDDINGS READY');
      await insertIntoDatabase(input, embedding, url);
      console.log('DATABASE READY');
    } catch (error) {
      console.error('Error in processing document:', error);
    }
  }
}

async function getEmbedding(input) {
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

  if (!embeddingResponse.ok) {
    throw new Error(
      `Failed to get embeddings: ${embeddingResponse.statusText}`
    );
  }

  const embeddingData = await embeddingResponse.json();
  const [{ embedding }] = embeddingData.data;
  return embedding;
}

async function insertIntoDatabase(input, embedding, url) {
  try {
    await supabaseClient.from('documents').insert({
      content: input,
      embedding,
      url,
    });
  } catch (error) {
    console.error('error in supabase insert: ' + error);
    throw error;
  }
}

async function getDocument(text, url) {
  const documents = [];

  handleText(url, text, documents);

  if (documents.length === 0) {
    return { error: 'Document array is empty' };
  }

  return documents;
}

function handleText(url, text, documents) {
  console.log('text length: ' + text.length);
  console.log('text word count: ' + count(text));

  let start = 0;
  while (start < text.length) {
    const end = start + docSize;
    const chunk = text.slice(start, end);

    const totalChars =
      documents.reduce((acc, doc) => acc + doc.body.length, 0) + chunk.length;
    const totalWords =
      count(chunk) + documents.reduce((acc, doc) => acc + count(doc.body), 0);

    if (totalChars > maxChars || totalWords > maxWords) {
      console.log('totalChars: ' + totalChars);
      console.log('totalWords: ' + totalWords);
      console.log('Reached maximum allowed size. Breaking out of the loop.');
      break;
    }

    documents.push({ url, body: chunk });
    start = end;
  }
}
