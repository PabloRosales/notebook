import React, { Fragment } from 'react';
import { Combobox, Dialog, Transition } from '@headlessui/react';
import { classNames } from '@headlessui/react/dist/utils/class-names';
import { IItem } from './Item';

interface Item {
  id: string;
  name: string;
  icon: string;
}

interface Props {
  item?: IItem;
  items: Item[];
  show: boolean;
  query: string;
  setShow: (show: boolean) => void;
  setQuery: (query: string) => void;
  runCommand: (command: string, id: number) => void;
}

const Command = ({ item, items, show, setShow, query, setQuery, runCommand }: Props) => {
  if (!item) {
    return null;
  }

  return (
    <Transition.Root show={show} as={Fragment} appear>
      <Dialog as="div" className="relative z-10" onClose={setShow}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl transform rounded-xl bg-slate-800 p-2 shadow-2xl ring-1 ring-white ring-opacity-5 transition-all">
              <Combobox value={query} onChange={setQuery}>
                <div className="text-xs text-slate-400 pb-2 pt-1 pl-1.5 italic truncate">{item.text}</div>
                <Combobox.Input
                  value={query}
                  placeholder="Action..."
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e: any) => {
                    if (e.key === 'Enter') {
                      setShow(false);
                      runCommand(query, item.id);
                    }
                  }}
                  className="w-full rounded-md border-0 bg-slate-900 px-4 py-2.5 text-slate-100 placeholder-slate-300 focus:ring-0 sm:text-sm"
                />
                {items.length > 0 && (
                  <Combobox.Options className="-mb-2 max-h-72 scroll-py-2 overflow-y-auto py-2 text-sm text-slate-100">
                    {items
                      .filter((item) => !query || item.id.includes(query))
                      .map((item) => (
                        <Combobox.Option
                          key={item.id}
                          value={item.id}
                          className={({ active }) =>
                            classNames(
                              'cursor-pointer flex items-center select-none rounded-md px-4 py-2 mb-1',
                              active && 'bg-slate-600 text-white',
                            )
                          }
                        >
                          <i className={`${item.icon} w-4 mr-3 text-center`} /> {item.name}
                        </Combobox.Option>
                      ))}
                  </Combobox.Options>
                )}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Command;
