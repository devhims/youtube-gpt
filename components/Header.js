import Image from 'next/image';
import Link from 'next/link';
import GitHub from './GitHub';

export default function Header() {
  return (
    <header className='flex justify-between items-center w-full mt-5 border-b-2 pb-5 sm:px-4 px-2'>
      <Link href='/' className='flex space-x-2 items-center'>
        <Image
          alt='header text'
          src='/ytlogo.png'
          className='sm:w-12 sm:h-12 w-8 h-8'
          width={32}
          height={32}
        />
        <h1 className='sm:text-4xl text-2xl font-bold ml-2 tracking-tight'>
          YouTubeGPT
        </h1>
      </Link>
      <a
        className='flex items-center justify-center max-w-fit space-x-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 shadow-md transition-colors hover:bg-gray-100'
        href='https://github.com/your-repo'
        target='_blank'
        rel='noopener noreferrer'
      >
        <GitHub className='w-5 h-5' />
        <p className='m-0'>Star on GitHub</p>
      </a>
    </header>
  );
}
