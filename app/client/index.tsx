import Command from './Command';
import Item from './Item';
import { useImmer } from 'use-immer';
import { createRoot } from 'react-dom/client';
import React, { KeyboardEventHandler, useCallback, useEffect, useState } from 'react';
import { Doc, IItem } from './types';
import { addNewItem, createTree, dedent, getStoredDoc, indent, moveUpOrDown, storeDoc } from './helpers';

// TODO: Remove this
const DEBUG = false;

const ACTIONS = [
  { name: 'Set icon', id: 'set-icon', icon: 'ri-cake-line' },
  { name: 'Screenshot', id: 'screenshot', icon: 'ri-camera-fill' },
  { name: 'Show image', id: 'show-image', icon: 'ri-image-line' },
  { name: 'Send to Email', id: 'send-email', icon: 'ri-mail-line' },
];

const App = () => {
  const [doc, setDoc] = useImmer<Doc>(getStoredDoc);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState<IItem | undefined>();
  const [showCommand, setShowCommand] = useState(false);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        setQuery('');
        setShowCommand(true);
      } else if (e.code === 'Escape') {
        setQuery('');
        setShowCommand(false);
      } else if (e.code === 'ArrowUp') {
        moveUpOrDown(doc.children, focused, 'up');
      } else if (e.code === 'ArrowDown') {
        moveUpOrDown(doc.children, focused, 'down');
      } else if (e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        setDoc((draft) => {
          dedent(draft.children, focused);
          storeDoc(draft);
        });
      } else if (e.code === 'Tab') {
        e.preventDefault();
        setDoc((draft) => {
          indent(draft.children, focused);
          storeDoc(draft);
        });
      }
    };

    document.addEventListener('keydown', handle);

    return () => {
      document.removeEventListener('keydown', handle);
    };
  }, [doc.children, focused, setDoc]);

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (!e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        setDoc((draft) => {
          const result = addNewItem(doc.children, focused);
          if (result.newId) {
            draft.children = [...result.items];
            setTimeout(() => {
              const item = document.getElementById(`item-${result.newId}`);
              if (item) {
                item.focus();
              }
            }, 100);
          }
        });
      }
    },
    [doc.children, focused, setDoc],
  );

  const onInput = useCallback(
    (s: string) => {
      setDoc((draft) => {
        if (focused) {
          const item = draft.children.find((item) => item.id === focused.id);
          if (item) {
            item.text = s;
            storeDoc(draft);
          }
        }
      });
    },
    [focused, setDoc],
  );

  if (DEBUG) {
    console.log(doc.children);
  }

  return (
    <div>
      <Command
        query={query}
        item={focused}
        show={showCommand}
        setQuery={setQuery}
        setShow={setShowCommand}
        runCommand={(command: string, id: number) => {
          console.log(command, id);
        }}
        items={ACTIONS}
      />
      <div className="relative mx-auto flex max-w-6xl h-screen p-5 rounded overflow-y-auto">
        <div className="w-2/12">
          <div className="pr-8 h-full">
            <div className="border-r border-slate-800 h-full select-none">
              <div className="uppercase text-xs text-slate-400 font-medium pl-2">Documents List</div>
              <div className="mt-3">
                {[doc].map((_doc) => {
                  return (
                    <div
                      className="text-slate-50 hover:bg-slate-800 truncate text-sm border-b border-slate-700 py-1 pl-2 cursor-pointer"
                      key={_doc.id}
                    >
                      {_doc.title}
                    </div>
                  );
                })}
                <div className="text-right p-2">
                  <i className="ri-plus-line text-slate-600 hover:text-lime-600 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-10/12">
          <div className="text-xl dark:text-white mb-5">{doc.title}</div>
          {createTree(doc.children).map((item) => {
            return (
              <Item
                level={0}
                item={item}
                key={item.id}
                onChange={onInput}
                onKeyDown={onKeyDown}
                id={`item-${item.id}`}
                setFocused={setFocused}
                onFocused={() => setFocused(item)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
