type ItemType = 'h1' | 'note' | 'image';

export interface IItem {
  id: number;
  text: string;
  icon?: string;
  href?: string;
  parent?: number;
  type?: ItemType;
  children?: IItem[];
}

export interface Doc {
  id: string;
  title: string;
  children: IItem[];
}
