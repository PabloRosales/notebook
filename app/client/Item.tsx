import React, { Fragment, KeyboardEventHandler } from 'react';
import { IItem } from './types';

interface ItemRenderProps {
  id: string;
  text: string;
  onFocused?: () => void;
  onChange: (s: string) => void;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
}

interface ItemProps {
  id: string;
  item: IItem;
  level: number;
  onFocused: () => void;
  onChange: (s: string) => void;
  setFocused: (item: IItem) => void;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
}

const ItemBase = ({ text, onChange, onKeyDown, onFocused, id }: ItemRenderProps) => {
  return (
    <div
      id={id}
      contentEditable
      spellCheck={false}
      onFocus={onFocused}
      onKeyDown={onKeyDown}
      dangerouslySetInnerHTML={{ __html: text }}
      className="flex-grow ml-1 py-0.5 focus:text-white focus:outline-none"
      onBlur={(e) => onChange(e.currentTarget.textContent || '')}
    />
  );
};

const ItemH1 = ({ text, onChange, onKeyDown, onFocused, id }: ItemRenderProps) => {
  return (
    <div
      id={id}
      contentEditable
      spellCheck={false}
      onFocus={onFocused}
      onKeyDown={onKeyDown}
      dangerouslySetInnerHTML={{ __html: text }}
      className="flex-grow ml-1 py-0.5 text-lg focus:text-white focus:outline-none"
      onBlur={(e) => onChange(e.currentTarget.textContent || '')}
    />
  );
};

const ItemNote = ({ text, onChange, onKeyDown, onFocused, id }: ItemRenderProps) => {
  return (
    <div className="flex-grow ml-1 py-0.5">
      <span
        id={id}
        contentEditable
        spellCheck={false}
        onFocus={onFocused}
        onKeyDown={onKeyDown}
        dangerouslySetInnerHTML={{ __html: text }}
        className="px-2 py-0.5 bg-sky-900 focus:text-white focus:outline-none"
        onBlur={(e) => onChange(e.currentTarget.textContent || '')}
      />
    </div>
  );
};

const ItemImage = ({ text, onChange, onKeyDown, onFocused, id }: ItemRenderProps) => {
  return (
    <Fragment>
      <div
        id={id}
        contentEditable
        spellCheck={false}
        onFocus={onFocused}
        onKeyDown={onKeyDown}
        dangerouslySetInnerHTML={{ __html: text }}
        className="flex-grow py-0.5 text-slate-500 focus:text-white focus:outline-none"
        onBlur={(e) => onChange(e.currentTarget.textContent || '')}
      />
      <div className="pl-3 pb-3 mt-2 w-full">
        <img src={text} alt="image" className="max-w-[300px] cursor-pointer" />
      </div>
    </Fragment>
  );
};

const Item = ({ id, item, level, onChange, onFocused, setFocused, onKeyDown }: ItemProps) => {
  return (
    <div className="item dark:text-slate-100 w-full text-sm">
      <div className="flex flex-wrap items-center rounded focus-within:dark:bg-neutral-800">
        <div
          className={`flex px-2 items-center cursor-pointer ${
            item.children && item.children.length > 0 ? 'text-sky-500 hover:text-sky-300' : 'text-slate-500 hover:text-slate-200'
          }`}
        >
          <i className={`${item.icon ? item.icon : 'ri-checkbox-blank-circle-fill ri-xs'}`} />
        </div>
        {item.type === undefined && <ItemBase onChange={onChange} onKeyDown={onKeyDown} id={id} onFocused={onFocused} text={item.text} />}
        {item.type === 'h1' && <ItemH1 onChange={onChange} onKeyDown={onKeyDown} id={id} onFocused={onFocused} text={item.text} />}
        {item.type === 'note' && <ItemNote onChange={onChange} onKeyDown={onKeyDown} id={id} onFocused={onFocused} text={item.text} />}
        {item.type === 'image' && <ItemImage onChange={onChange} onKeyDown={onKeyDown} id={id} onFocused={onFocused} text={item.text} />}
      </div>
      {item.children && (
        <div className={`${item.children ? 'border-l border-slate-600 pl-4 ml-3 my-1' : item.children ? '' : ''}`}>
          {item.children?.map((subItem) => {
            return (
              <Item
                item={subItem}
                key={subItem.id}
                level={level + 1}
                onChange={onChange}
                onKeyDown={onKeyDown}
                setFocused={setFocused}
                id={`item-${subItem.id}`}
                onFocused={() => setFocused(subItem)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Item;
