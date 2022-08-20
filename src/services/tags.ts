import type { Tag } from '../models';
import { Database } from './database';
import { Pocket } from './pocket';

const pocket = new Pocket();
const database = new Database();

export class Tags {
  static getById(id: string, includeCount = false): Promise<Tag> {
    return database.getTagById(id, includeCount);
  }

  static getAll(includeCount = false): Promise<Tag[]> {
    return database.getAllTags(includeCount);
  }

  static async delete(id: string): Promise<void> {
    await pocket.deleteTag(id);
    await database.deleteTag(id);
  }

  static async deleteAll(): Promise<void> {
    await database.deleteAllTags();
  }
}
