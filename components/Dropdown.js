import { Menu, Transition } from '@headlessui/react';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/20/solid';
import { Fragment } from 'react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

let counts = ['1 sentence', '100 words', '200 words', '500 words'];

export default function DropDown({ count, setCount }) {
  return (
    <Menu as='div' className='relative block text-left w-full'>
      <div>
        <Menu.Button className='py-3 text-lg inline-flex w-full justify-between items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black'>
          {count}
          <ChevronUpIcon
            className='-mr-1 ml-2 h-5 w-5 ui-open:hidden'
            aria-hidden='true'
          />
          <ChevronDownIcon
            className='-mr-1 ml-2 h-5 w-5 hidden ui-open:block'
            aria-hidden='true'
          />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <Menu.Items
          className='absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
          key={count}
        >
          <div className=''>
            {counts.map((countItem) => (
              <Menu.Item key={countItem}>
                {({ active }) => (
                  <button
                    onClick={() => setCount(countItem)}
                    className={classNames(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      count === countItem ? 'bg-gray-200' : '',
                      'px-4 py-2 text-sm w-full text-left flex items-center space-x-2 justify-between'
                    )}
                  >
                    <span>{countItem}</span>
                    {count === countItem ? (
                      <CheckIcon className='w-4 h-4 text-bold' />
                    ) : null}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
