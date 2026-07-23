export interface Professional {
  id: string;
  name: string;
  city: string;
  avatarUrl: string;
  hasCnpj: boolean;
}

export interface FeedPost {
  id: string;
  title: string;
  authorName: string;
  date: string;
  excerpt: string;
  imageUrl: string;
}

export type BottomTabKey = 'home' | 'documents' | 'profile' | 'tools' | 'menu';
