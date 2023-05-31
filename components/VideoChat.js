import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { MdSend } from 'react-icons/md';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import ChatMessage from './ChatMessage';
import LoadingDots from './LoadingDots';

// This component renders a video chat interface
const VideoChat = ({ title, summary }) => {
  const textAreaRef = useRef(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch answer from the server
  const getAnswer = async (question, callback) => {
    try {
      const res = await fetch('/api/get-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, summary }),
      });

      console.log('fetch docs returned.');

      if (!res.ok) throw new Error(res.statusText);

      // This data is a ReadableStream
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');

      // Initialise an empty answer
      let answer = '';

      // Process stream and handle chunks of data
      reader.read().then(function processStream({ done, value }) {
        if (done) return;
        const chunkValue = decoder.decode(value);
        answer += chunkValue;
        callback(answer);
        return reader.read().then(processStream);
      });
    } catch (error) {
      console.log('An error occurred', error);
    }
  };

  // Handle the input changes
  const handleChange = (e) => {
    setInput(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input) return;
    const userMessageId = messages.length;
    setMessages([
      ...messages,
      { id: userMessageId, role: 'user', content: input },
    ]);
    setInput('');
    setLoading(true);
    getAnswer(input, (newAnswerChunk) => {
      const assistantMessageId = userMessageId + 1;
      setMessages((prevMessages) => {
        if (prevMessages.some((message) => message.id === assistantMessageId)) {
          return prevMessages.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: newAnswerChunk }
              : message
          );
        }
        return [
          ...prevMessages,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: newAnswerChunk,
          },
        ];
      });
      setLoading(false);
    });
  };

  useEffect(() => {
    // Handling enter key press
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Cleaning up the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSubmit, input]);

  return (
    <div className='flex max-w-5xl mx-auto flex-col items-center justify-start py-2 min-h-screen'>
      <Head>
        <title>YouTubeGPT</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Header />
      <main className='flex flex-1 w-full flex-col items-center justify-start text-center px-4 mt-12 sm:mt-10'>
        <h1 className='sm:text-4xl text-3xl max-w-[708px] font-bold text-slate-900 mb-7 mt-2 sm:mt-2'>
          {title}
        </h1>
        <p className='text-left font-medium max-w-2xl mx-auto'>{summary}</p>

        <div className='chat-messages w-full max-w-2xl mx-auto text-left mt-5'>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {loading && (
            <div className='flex justify-center items-center'>
              <LoadingDots />
            </div>
          )}
        </div>
      </main>
      <div className='flex h-40 w-full bg-gradient-to-t from-[rgb(var(--bg-secondary))] to-transparent md:w-[calc(100%-260px)] items-center justify-center'>
        <form
          className='mx-auto flex h-full w-full max-w-4xl items-end justify-center p-4 pb-5'
          onSubmit={handleSubmit}
        >
          <div className='relative flex w-full flex-row rounded border border-stone-500/20 bg-tertiary shadow-xl'>
            <textarea
              ref={textAreaRef}
              className='max-h-[200px] w-full resize-none border-none bg-tertiary p-4 text-primary outline-none focus:border-black focus:ring-black'
              onChange={handleChange}
              value={input}
              rows={1}
            />
            <button
              type='submit'
              className='rounded p-4 text-primary hover:bg-primary/50'
            >
              {loading ? (
                <div className='mx-auto h-5 w-5 animate-spin rounded-full border-b-2 border-white' />
              ) : (
                <MdSend />
              )}
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

VideoChat.propTypes = {
  title: PropTypes.string.isRequired,
  summary: PropTypes.string.isRequired,
};

export default VideoChat;
