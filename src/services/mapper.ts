import type { Article, PocketArticle } from '../models';

export function toArticle(source: PocketArticle): Article {
  return {
    id: source.item_id,
    url: source.resolved_url,
    title: source.resolved_title,
    excerpt: source.excerpt,
    wordCount: Number(source.word_count),
    timeToRead: source.time_to_read,
    imageUrl: source.top_image_url,
    isArchived: source.status === '1' ? 1 : 0,
    isFavorite: Number(source.favorite) as 0 | 1,
    favoritedAt: parseDate(source.time_favorited),
    readAt: parseDate(source.time_read),
    createdAt: parseDate(source.time_added),
    updatedAt: parseDate(source.time_updated),
    tags: Object.keys(source.tags ?? {}),
  };
}

function parseBool(val: any): boolean {
  switch (val) {
    case true:
    case 1:
    case '1':
    case 'true':
      return true;
    case false:
    case 0:
    case '0':
    case 'false':
      return false;
    default:
      throw new Error(`Value ${val} cannot be converted to a boolean`);
  }
}

function parseDate(seconds: string): string | null {
  if (seconds === '0') return null;

  return new Date(Number(seconds) * 1000).toISOString();
}
