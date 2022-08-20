import Dexie, { Collection } from 'dexie';
import type { Article } from '../models';
import { PerfLogger } from './perfLogger';

type ArticleQuery = {
  ids?: string[];
  isArchived?: 0 | 1;
  isFavorite?: 0 | 1;
  offset?: number;
  limit?: number;
};

type ArticleSort = {
  sortKey: 'id' | 'timeToRead' | 'isArchived' | 'isFavorite' | 'createdAt' | 'updatedAt' | 'readAt';
  sortDir: 'asc' | 'desc';
};

export class Database extends Dexie {
  articles: Dexie.Table<Article, string>;

  constructor() {
    super('pock');

    this.version(1).stores({
      articles: '&id, timeToRead, isArchived, isFavorite, createdAt, updatedAt, readAt',
    });

    this.articles = this.table('articles');
  }

  // Articles

  public async addArticle(article: Article): Promise<void> {
    PerfLogger.start(`database.addArticle ${article.id}`);
    await this.articles.put(article);
    PerfLogger.stop(`database.addArticle ${article.id}`);
  }

  public async addArticles(articles: Article[]): Promise<void> {
    PerfLogger.start('database.addArticles');
    await this.articles.bulkPut(articles);
    PerfLogger.stop('database.addArticles');
  }

  public async deleteArticles(ids: string[]): Promise<void> {
    PerfLogger.start('database.deleteArticles');
    await this.articles.bulkDelete(ids);
    PerfLogger.stop('database.deleteArticles');
  }

  public async deleteAllArticles(): Promise<void> {
    PerfLogger.start('database.deleteAllArticles');
    await this.articles.clear();
    PerfLogger.stop('database.deleteAllArticles');
  }

  public async getArticleById(id: string): Promise<Article | null> {
    PerfLogger.start(`database.getArticleById ${id}`);
    const result = await this.articles.get({ id });
    PerfLogger.stop(`database.getArticleById ${id}`);
    return result;
  }

  public async updateArticle(id: string, changes: Partial<Article>): Promise<Article> {
    PerfLogger.start(`database.updateArticle ${id}`);
    await this.articles.update(id, {
      ...changes,
      updatedAt: new Date().toISOString(),
    });
    const result = await this.articles.get({ id });
    PerfLogger.stop(`database.updateArticle ${id}`);
    return result;
  }

  public async getArticles(
    { ids, isArchived, isFavorite, offset = 0, limit = 50 }: ArticleQuery,
    { sortKey = 'createdAt', sortDir = 'desc' }: ArticleSort
  ): Promise<Article[]> {
    PerfLogger.start('database.getArticles');
    let query: Collection<Article, string>;

    // Filter

    if (Array.isArray(ids)) {
      query = this.articles.where('id').anyOf(ids);
    } else if (isArchived !== undefined) {
      query = this.articles.where('isArchived').equals(isArchived);
    } else if (isFavorite !== undefined) {
      query = this.articles.where('isFavorite').equals(isArchived);
    } else {
      query = this.articles.toCollection();
    }

    if (Array.isArray(ids)) {
      query = query.and((a) => ids.includes(a.id));
    }

    if (isArchived !== undefined) {
      query = query.and((a) => a.isArchived === isArchived);
    }

    if (isFavorite !== undefined) {
      query = query.and((a) => a.isFavorite === isFavorite);
    }

    // Sort

    if (sortDir === 'desc') {
      query = query.reverse();
    }

    const res = await query.sortBy(sortKey).then((res) => res.slice(offset, offset + limit));
    PerfLogger.stop('database.getArticles');

    return res;
  }
}
