import React, { useState, useEffect, useRef } from 'react';
import { MdSend } from 'react-icons/md';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import ChatMessage from './ChatMessage';
import LoadingDots from './LoadingDots';
import MarkdownRenderer from './MarkdownRenderer';
import ReactMarkdown from 'react-markdown';

const VideoChat = ({ title, summary }) => {
  const textAreaRef = useRef(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');

  const getAnswer = async (question, callback) => {
    const res = await fetch('/api/fetch-docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, summary }),
    });

    console.log('fetch docs returned.');

    if (!res.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = res.body;
    if (!data) {
      console.log('No data returned.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let answer = '';

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      answer += chunkValue;
      callback(answer);
    }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input) return;

    // Keep track of the user message ID
    const userMessageId = messages.length;

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: userMessageId, role: 'user', content: input },
    ]);

    setInput('');
    setLoading(true);

    getAnswer(input, (newAnswerChunk) => {
      // Keep track of the assistant message ID
      const assistantMessageId = userMessageId + 1;

      setAnswer(newAnswerChunk);

      // Update the messages list with the new assistant message
      setMessages((prevMessages) => {
        // If the assistant message already exists, update it
        if (prevMessages.some((message) => message.id === assistantMessageId)) {
          return prevMessages.map((message) =>
            message.id === assistantMessageId
              ? { ...message, content: newAnswerChunk }
              : message
          );
        }

        // If it doesn't exist yet, add it
        return [
          ...prevMessages,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: newAnswerChunk,
          },
        ];
      });

      // Set loading to false as soon as the first chunk comes in
      setLoading(false);
    });
  };

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = '40px';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

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

export default VideoChat;
