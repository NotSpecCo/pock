import type { Article } from '../models';
import { Database } from './database';
import { Pocket } from './pocket';

const pocket = new Pocket();
const database = new Database();

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

export class Articles {
  static fetchAll(): Promise<Article[]> {
    return pocket.getAllArticles();
  }

  static async getById(id: string): Promise<Article | null> {
    const item = await database.getArticleById(id);

    if (!item) return null;

    item.tags = await database
      .getArticleTagsByItemId(item.id)
      .then((res) => res.map((a) => a.tagId));

    return item;
  }

  static async getAllByTagId(tagId: string): Promise<Article[]> {
    const itemIds = await database
      .getArticleTagsByTagId(tagId)
      .then((res) => res.map((a) => a.itemId));
    if (itemIds.length == 0) return [];

    return database.getArticles({ ids: itemIds }, { sortKey: 'createdAt', sortDir: 'desc' });
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

  static async addTag(id: string, tagId: string): Promise<void> {
    await pocket.addTags(id, [tagId]);

    const exists = await database.getTagById(tagId);
    if (!exists) {
      await database.addTags([{ id: tagId, value: tagId }]);
    }

    await database.addArticleTags([{ id: undefined, itemId: id, tagId }]);
  }

  static async removeTag(id: string, tagId: string): Promise<void> {
    await pocket.removeTags(id, [tagId]);
    await database.deleteArticleTagsByItemAndTagId(id, tagId);
  }

  static async replaceTags(id: string, tagIds: string[]): Promise<void> {
    await pocket.replaceTags(id, tagIds);
    await database.deleteArticleTagsByItemId(id);
    await database.addArticleTags(
      tagIds.map((tagId) => ({
        id: undefined,
        tagId: tagId,
        itemId: id,
      }))
    );
  }
}
