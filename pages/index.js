import Head from 'next/head';
import { useState } from 'react';
import NewVideo from '@/components/NewVideo';
import VideoChat from '@/components/VideoChat';

export default function Home() {
  const [summary, setSummary] = useState('');
  const [title, setTitle] = useState('');

  return (
    <>
      <Head>
        <title>YouTubeGPT</title>
        <meta
          name='description'
          content='Generate summaries and chat with YouTube videos'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        {title && summary ? (
          <VideoChat title={title} summary={summary} />
        ) : (
          <NewVideo setTitle={setTitle} setSummary={setSummary} />
        )}
      </main>
    </>
  );
}
