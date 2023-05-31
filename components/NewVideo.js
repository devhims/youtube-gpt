import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Image from 'next/image';

import Header from './Header';
import Footer from './Footer';
import DropDown from './Dropdown';
import LoadingDots from './LoadingDots';

import { extractVideoId } from '@/utils/helpers';

const NewVideo = ({ setTitle, setSummary }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [count, setCount] = useState('1 sentence');
  const [videoURL, setVideoURL] = useState('');

  // Function to fetch and create embeddings from the server
  const createEmbeddings = async (id) => {
    try {
      const response = await fetch('/api/create-embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoID: id }),
      });

      if (!response.ok) {
        const data = await response.json();
        return toast.error(data.message || 'Request failed');
      }
    } catch (error) {
      toast.error('An error occurred while processing your request.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch the video title from the server
  const getTitle = async (videoId) => {
    const res = await fetch(`/api/video-info?videoID=${videoId}`);
    const data = await res.json();
    setTitle(data.title);
    return data.title;
  };

  // Function to generate a video summary
  const generateSummary = async (url) => {
    setIsLoading(true);

    const videoId = extractVideoId(url);
    // If the video ID is null, this isn't a YouTube video.
    if (!videoId) {
      setIsLoading(false);
      // Display a toast error to the user
      toast.error('Invalid URL. Please enter a YouTube video URL.');
      return;
    }

    console.log('videoId: ', videoId);

    // Create embeddings
    createEmbeddings(videoId);

    const title = await getTitle(videoId);
    console.log('title: ', title);

    const response = await fetch(
      `/api/summary?videoId=${videoId}&count=${count}`
    );

    console.log('Edge function returned.');

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      console.log('No data returned.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      // Append each new chunk to the summary using function version of setSummary
      setSummary((prevSummary) => prevSummary + chunkValue);
    }

    setIsLoading(false);
  };

  return (
    <div className='flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen'>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-20 sm:mt-5'>
        <Toaster
          position='top-center'
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <h1 className='sm:text-6xl text-4xl max-w-[708px] font-bold text-slate-900 mb-10'>
          Generate summary and chat with YouTube videos
        </h1>
        <div className='max-w-xl w-full'>
          <div className='flex mt-10 items-center space-x-3'>
            <Image
              src='/1-black.png'
              width={30}
              height={30}
              alt='1 icon'
              className='mb-5 sm:mb-0'
            />
            <p className='text-left font-medium'>
              Paste link to the YouTube video in the box below
            </p>
          </div>
          <div className='w-full mx-auto mt-4'>
            <input
              className='w-full px-4 py-3 border-2 border-gray-300 rounded-md text-lg focus:border-black focus:ring-black'
              type='text'
              placeholder='Enter YouTube video URL'
              value={videoURL}
              onChange={(e) => setVideoURL(e.target.value)}
            />
          </div>
          <div className='flex mt-10 items-center space-x-3'>
            <Image
              src='/2-black.png'
              width={30}
              height={30}
              alt='1 icon'
              className='mb-5 sm:mb-0'
            />
            <p className='text-left font-medium'>Select summary length</p>
          </div>
          <div className='block mt-4'>
            <DropDown
              count={count}
              setCount={(newInput) => setCount(newInput)}
            />
          </div>
          <div className='w-full mx-auto mt-6'>
            {!isLoading && (
              <button
                className='w-full px-4 py-3 bg-black text-white rounded-lg text-lg hover:bg-black/80 transition-colors'
                type='button'
                onClick={() => generateSummary(videoURL)}
              >
                Generate Summary
              </button>
            )}
            {isLoading && (
              <button
                className='w-full px-4 py-3 bg-black text-white rounded-lg text-lg hover:bg-black/80 transition-colors'
                type='button'
                disabled
              >
                <LoadingDots color='white' style='large' />
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewVideo;
