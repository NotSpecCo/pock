export type Article = {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  fullText?: string;
  wordCount: number;
  timeToRead: number;
  imageUrl?: string;
  isArchived: 0 | 1;
  isFavorite: 0 | 1;
  favoritedAt: string;
  readAt: string;
  createdAt: string;
  updatedAt: string;
};
