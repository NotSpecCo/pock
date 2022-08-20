import Dexie, { Collection } from 'dexie';
import type { Article, ArticleTagMap, Tag } from '../models';
import { PerfLogger } from './perfLogger';

type ArticleQuery = {
  ids?: string[];
  tagId?: string;
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

export class Database extends Dexie {
  articles: Dexie.Table<Article, string>;
  tags: Dexie.Table<Tag, string>;
  articleTags: Dexie.Table<ArticleTagMap, number>;

  constructor() {
    super('pock');

    this.version(1).stores({
      articles:
        '&id, timeToRead, isArchived, isFavorite, createdAt, updatedAt, readAt, favoritedAt',
      tags: '&id, value',
      articleTags: '++id, itemId, tagId',
    });

    this.articles = this.table('articles');
    this.articleTags = this.table('articleTags');
    this.tags = this.table('tags');
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
    { ids, tagId, isArchived, isFavorite, offset = 0, limit = 50 }: ArticleQuery,
    { sortKey = 'createdAt', sortDir = 'desc' }: ArticleSort
  ): Promise<Article[]> {
    PerfLogger.start('database.getArticles');
    let query: Collection<Article, string>;

    // Filter

    if (Array.isArray(ids)) {
      query = this.articles.where('id').anyOf(ids);
    } else if (tagId !== undefined) {
      const itemIds = await this.articleTags
        .where({ tagId })
        .toArray()
        .then((res) => res.map((a) => a.itemId));
      query = this.articles.where('id').anyOf(itemIds);
    } else if (isArchived !== undefined) {
      query = this.articles.where('isArchived').equals(isArchived);
    } else if (isFavorite !== undefined) {
      query = this.articles.where('isFavorite').equals(isFavorite);
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

  // Articles <-> Tags

  public async addArticleTags(items: ArticleTagMap[]): Promise<void> {
    PerfLogger.start('database.addArticleTags');
    await this.articleTags.bulkPut(items);
    PerfLogger.stop('database.addArticleTags');
  }

  public async replaceArticleTags(itemId: string, tagIds: string[]): Promise<void> {
    PerfLogger.start('database.replaceArticleTags');
    await this.articleTags.where({ itemId }).delete();
    if (tagIds.length > 0) {
      await this.articleTags.bulkPut(tagIds.map((tagId) => ({ itemId, tagId, id: undefined })));
    }
    PerfLogger.stop('database.replaceArticleTags');
  }

  public async getArticleTagsByItemId(itemId: string): Promise<ArticleTagMap[]> {
    PerfLogger.start('database.getArticleTagsByItemId');
    const result = await this.articleTags.where({ itemId }).toArray();
    PerfLogger.stop('database.getArticleTagsByItemId');
    return result;
  }

  public async getArticleTagsByTagId(tagId: string): Promise<ArticleTagMap[]> {
    PerfLogger.start('database.getArticleTagsByTagId');
    const result = await this.articleTags.where({ tagId }).toArray();
    PerfLogger.stop('database.getArticleTagsByTagId');
    return result;
  }

  public async deleteAllArticleTags(): Promise<void> {
    PerfLogger.start('database.deleteAllArticleTags');
    await this.articleTags.clear();
    PerfLogger.stop('database.deleteAllArticleTags');
  }

  public async deleteArticleTagsByTagId(tagId: string): Promise<void> {
    PerfLogger.start('database.deleteArticleTagsByTagId');
    await this.articleTags.where({ tagId }).delete();
    PerfLogger.stop('database.deleteArticleTagsByTagId');
  }

  public async deleteArticleTagsByItemId(itemId: string): Promise<void> {
    PerfLogger.start('database.deleteArticleTagsByItemId');
    await this.articleTags.where({ itemId }).delete();
    PerfLogger.stop('database.deleteArticleTagsByItemId');
  }

  public async deleteArticleTagsByItemAndTagId(itemId: string, tagId: string): Promise<void> {
    PerfLogger.start('database.deleteArticleTagsByItemId');
    await this.articleTags.where({ itemId, tagId }).delete();
    PerfLogger.stop('database.deleteArticleTagsByItemId');
  }

  // Tags

  public async addTags(tags: Tag[]): Promise<void> {
    PerfLogger.start('database.addTags');
    await this.tags.bulkPut(tags);
    PerfLogger.stop('database.addTags');
  }

  public async updateTag(id: string, changes: Partial<Tag>): Promise<void> {
    PerfLogger.start('database.updateTag');
    await this.tags.update(id, changes);
    PerfLogger.stop('database.updateTag');
  }

  public async getAllTags(includeCounts = false): Promise<Tag[]> {
    PerfLogger.start(`database.getAllTags`);
    const result = await this.tags.toArray();

    if (includeCounts) {
      for (const tag of result) {
        tag.itemCount = await this.articleTags.where({ tagId: tag.id }).count();
      }
    }

    PerfLogger.stop(`database.getAllTags`);
    return result;
  }

  public async getTagById(id: string, includeCounts = false): Promise<Tag | null> {
    PerfLogger.start(`database.getTagById`);
    const result = await this.tags.where({ id }).first();

    if (includeCounts) {
      result.itemCount = await this.articleTags.where({ tagId: result.id }).count();
    }

    PerfLogger.stop(`database.getTagById`);
    return result;
  }

  public async getTagsByIds(ids: string[], includeCounts = false): Promise<Tag[]> {
    PerfLogger.start(`database.getTagsByIds`);
    const results = await this.tags.where('id').anyOf(ids).toArray();

    if (includeCounts) {
      for (const tag of results) {
        tag.itemCount = await this.articleTags.where({ tagId: tag.id }).count();
      }
    }

    PerfLogger.stop(`database.getTagsByIds`);
    return results;
  }

  public async deleteTag(id: string): Promise<void> {
    PerfLogger.start('database.deleteTag');
    await this.tags.delete(id);
    PerfLogger.stop('database.deleteTag');
  }

  public async deleteAllTags(): Promise<void> {
    PerfLogger.start('database.deleteAllTags');
    await this.tags.clear();
    PerfLogger.stop('database.deleteAllTags');
  }
}
