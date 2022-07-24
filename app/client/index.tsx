import Command from './Command';
import Item, { IItem } from './Item';
import { useImmer } from 'use-immer';
import { createRoot } from 'react-dom/client';
import React, { KeyboardEventHandler, useCallback, useEffect, useState } from 'react';

interface Doc {
  title: string;
  children: IItem[];
}

const ACTIONS = [
  { name: 'Set Icon', id: 'set-icon', icon: 'fa-solid fa-cake-slice' },
  { name: 'Screenshot', id: 'screenshot', icon: 'fa-solid fa-camera' },
  { name: 'Show Image', id: 'show-image', icon: 'fa-solid fa-image' },
];

const DOC: Doc = {
  title: 'Notebook',
  children: [
    {
      id: 0,
      type: 'h1',
      text: 'ToDo',
      icon: 'fa-solid fa-book',
    },
    {
      id: 1,
      parent: 0,
      text: 'Todo item 1',
    },
    {
      id: 2,
      parent: 1,
      text: 'A sub-item of item 1',
    },
    {
      id: 3,
      parent: 2,
      text: 'A sub-sub-item',
      children: [],
    },
    {
      id: 4,
      parent: 0,
      text: 'Todo item 2',
    },
    {
      id: 5,
      parent: 4,
      text: 'A sub item of 2',
    },
    {
      id: 6,
      parent: 4,
      type: 'note',
      text: 'This one here is a note highlight',
    },
    {
      id: 7,
      parent: 6,
      text: 'Just another sub-item',
    },
    {
      id: 8,
      text: 'Done',
    },
    {
      id: 9,
      parent: 8,
      type: 'image',
      icon: 'fa-solid fa-image',
      text: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/1dayoldkitten.JPG',
    },
    {
      id: 10,
      text: 'Later',
    },
    {
      id: 11,
      text: 'Maybe',
    },
  ],
};

const createSubTree = (items: IItem[], parentId: number): IItem[] => {
  const newChildren: IItem[] = [];
  const children = items.filter((item) => item.parent === parentId);

  for (const child of children) {
    const newChild = { ...child };
    newChild.children = createSubTree(items, child.id);
    newChildren.push(newChild);
  }

  return newChildren;
};

const moveUpOrDown = (items: IItem[], current: IItem | undefined, action: 'up' | 'down') => {
  if (!current) {
    return;
  }

  const currentId = current.id;
  const otherId = action === 'up' ? currentId - 1 : currentId + 1;
  const prev = items.find((item) => item.id === otherId);
  if (prev) {
    const item = document.getElementById(`item-${prev.id}`);
    if (item) {
      item.focus();
    }
  }
};

const createTree = (items: IItem[]): IItem[] => {
  const newItems = [];
  const allWithoutParent = items.filter((item) => item.parent === undefined);

  for (const parent of allWithoutParent) {
    const newItem = { ...parent };
    newItem.children = createSubTree(items, parent.id);
    newItems.push(newItem);
  }

  return newItems;
};

const addNewItem = (items: IItem[], item?: IItem): { items: IItem[]; newId?: number } => {
  if (!item) {
    return { items };
  }

  const itemsCopy = [...items];
  const newId = item.id + 1;

  for (const _item of itemsCopy) {
    if (_item.id > item.id) {
      let newParent: number | undefined = _item.parent;
      if (_item.parent && _item.parent !== item.parent) {
        newParent = _item.parent + 1;
      }

      itemsCopy[_item.id] = {
        ..._item,
        id: _item.id + 1,
        parent: newParent,
      };
    }
  }

  itemsCopy.splice(newId, 0, {
    text: '',
    id: newId,
    parent: item.parent,
  });

  return {
    newId,
    items: itemsCopy,
  };
};

const App = () => {
  const [doc, setDoc] = useImmer<Doc>(DOC);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState<IItem | undefined>();
  const [showCommand, setShowCommand] = useState(false);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Enter') {
        setQuery('');
        setShowCommand(true);
      } else if (e.code === 'Escape') {
        setQuery('');
        setShowCommand(false);
      } else if (e.code === 'ArrowUp') {
        moveUpOrDown(doc.children, focused, 'up');
      } else if (e.code === 'ArrowDown') {
        moveUpOrDown(doc.children, focused, 'down');
      }
    };

    document.addEventListener('keydown', handle);

    return () => {
      document.removeEventListener('keydown', handle);
    };
  }, [doc.children, focused, setDoc]);

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (e.key === 'Enter') {
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
      console.log('called');
      setDoc((draft) => {
        if (focused) {
          const item = draft.children.find((item) => item.id === focused.id);
          if (item) {
            console.log(s);
            item.text = s;
          }
        }
      });
    },
    [focused, setDoc],
  );

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
      <div className="relative mx-auto flex max-w-5xl h-screen p-5 rounded overflow-y-auto">
        <div className="w-full">
          <div className="text-xl dark:text-white mb-5">{DOC.title}</div>
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
