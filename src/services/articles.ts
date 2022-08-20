import type { Article } from '../models';
import { Database } from './database';
import { Pocket } from './pocket';

const pocket = new Pocket();
const database = new Database();

type ArticleQuery = {
  ids?: string[];
  isArchived?: 0 | 1;
  isFavorite?: 0 | 1;
  offset?: number;
  limit?: number;
};

type ArticleSort = {
  sortKey:
    | 'id'
    | 'timeToRead'
    | 'isArchived'
    | 'isFavorite'
    | 'createdAt'
    | 'updatedAt'
    | 'readAt'
    | 'favoritedAt';
  sortDir: 'asc' | 'desc';
};

export class Articles {
  static async sync(): Promise<number> {
    const articles = await pocket.getAllArticles();

    // Cache articles to the database
    await database.deleteAllArticles();
    await database.addArticles(articles);

    return articles.length;
  }

  static getById(id: string): Promise<Article | null> {
    return database.getArticleById(id);
  }

  static update(id: string, changes: Partial<Article>): Promise<Article> {
    return database.updateArticle(id, changes);
  }

  static query(query: ArticleQuery, sort: ArticleSort): Promise<Article[]> {
    return database.getArticles(query, sort);
  }

  static async archive(id: string): Promise<void> {
    await pocket.archive(id);
    await database.updateArticle(id, { isArchived: 1, updatedAt: new Date().toISOString() });
  }

  static async unarchive(id: string): Promise<void> {
    await pocket.unarchive(id);
    await database.updateArticle(id, { isArchived: 0, updatedAt: new Date().toISOString() });
  }

  static async favorite(id: string): Promise<void> {
    await pocket.favorite(id);
    await database.updateArticle(id, {
      isFavorite: 1,
      updatedAt: new Date().toISOString(),
      favoritedAt: new Date().toISOString(),
    });
  }

  static async unfavorite(id: string): Promise<void> {
    await pocket.unfavorite(id);
    await database.updateArticle(id, {
      isFavorite: 0,
      updatedAt: new Date().toISOString(),
      favoritedAt: null,
    });
  }

  static async delete(id: string): Promise<void> {
    await pocket.delete(id);
    await database.deleteArticles([id]);
  }
}
