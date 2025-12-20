export type Page = 
  | 'home' 
  | 'about' 
  | 'events' 
  | 'journal' 
  | 'journal-post'
  | 'gallery' 
  | 'membership' 
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'rules'
  | 'cookies';

export interface Event {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  altText: string;
  category?: string;
  description?: string;
  location?: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface GalleryItem {
  title: string;
  image: string;
  category: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  image: string;
  featured?: boolean;
}
