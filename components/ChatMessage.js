import { useState } from 'react';
import { MdPerson } from 'react-icons/md';
import { FaFilm } from 'react-icons/fa';

function ChatMessage({ message: { id, role, content } }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      className={`flex cursor-pointer flex-row items-start py-1 transition-all ${
        role === 'user' ? 'bg-tertiary hover:bg-secondary/50' : 'bg-secondary'
      }`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className='relative max-w-screen mx-auto flex w-full max-w-4xl flex-row items-start'>
        <div
          className={`flex my-2 h-10 w-10 items-center justify-center text-4xl mr-2 self-start transition-colors ${
            hover
              ? 'shadow-lg transition-shadow ease-in-out duration-500'
              : 'shadow'
          }`}
        >
          {role === 'user' ? <MdPerson /> : <FaFilm />}
        </div>
        <div
          className={`flex-1 overflow-x-auto bg-gray-100 rounded-lg p-3 min-w-0 ${
            hover
              ? 'shadow-lg transition-shadow ease-in-out duration-500'
              : 'shadow'
          }`}
        >
          <div className='text-md prose w-full max-w-full text-primary dark:prose-invert prose-code:text-primary prose-pre:bg-transparent prose-pre:p-0 break-words'>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
