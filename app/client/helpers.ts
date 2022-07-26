import { Doc, IItem } from './types';
import { last } from 'lodash';

export const createSubTree = (items: IItem[], parentId: number): IItem[] => {
  const newChildren: IItem[] = [];
  const children = items.filter((item) => item.parent === parentId);

  for (const child of children) {
    const newChild = { ...child };
    newChild.children = createSubTree(items, child.id);
    newChildren.push(newChild);
  }

  return newChildren;
};

export const moveUpOrDown = (items: IItem[], current: IItem | undefined, action: 'up' | 'down') => {
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

export const createTree = (items: IItem[]): IItem[] => {
  const newItems = [];
  const allWithoutParent = items.filter((item) => item.parent === undefined);

  for (const parent of allWithoutParent) {
    const newItem = { ...parent };
    newItem.children = createSubTree(items, parent.id);
    newItems.push(newItem);
  }

  return newItems;
};

export const addNewItem = (items: IItem[], item?: IItem): { items: IItem[]; newId?: number } => {
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

export const indent = (items: IItem[], item?: IItem): IItem[] => {
  if (!item) {
    return items;
  }

  const itemsCopy = [...items];
  const current = itemsCopy.find((_item) => _item.id === item.id);
  const prev = itemsCopy.find((_item) => _item.id === item.id - 1);

  if (current && prev && current.parent !== prev.id) {
    if (prev.parent !== undefined && prev.parent !== current.parent) {
      console.log('parent of prev');
      current.parent = prev.parent;
    } else {
      console.log('parent as prev');
      current.parent = prev.id;
    }
  }

  return itemsCopy;
};

export const dedent = (items: IItem[], item?: IItem): IItem[] => {
  if (!item) {
    return items;
  }

  const itemsCopy = [...items];
  const current = itemsCopy.find((_item) => _item.id === item.id);
  if (current) {
    if (current.parent !== undefined) {
      const parent = itemsCopy.find((_item) => _item.id === current.parent);
      if (parent) {
        current.parent = parent.parent;
        if (parent.children && parent.children.length > 1) {
          const lastChildId = parent.children[parent.children.length - 1].id;
          if (lastChildId !== current.id) {
            current.id = lastChildId + 1;
            for (const child of parent.children) {
              if (child.id <= current.id) {
                child.id++;
              }
            }
          }
        }
      }
    }
  }

  return itemsCopy;
};

export const getStoredDoc = (): Doc => {
  const emptyDoc: Doc = {
    id: 'notes',
    title: 'Notes',
    children: [
      {
        id: 0,
        text: '',
      },
    ],
  };

  const currentDoc = localStorage.getItem('doc-demo');

  if (currentDoc) {
    let _doc: Doc;
    try {
      _doc = JSON.parse(currentDoc);
    } catch (e) {
      alert('There was an error loading the document');
      _doc = emptyDoc;
    }
    return _doc;
  }
  return emptyDoc;
};

export const storeDoc = (doc: Doc) => {
  localStorage.setItem('doc-demo', JSON.stringify(doc));
};
