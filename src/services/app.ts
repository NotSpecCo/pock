import type { ArticleTagMap } from '../models';
import { Database } from './database';
import { PerfLogger } from './perfLogger';
import { Pocket } from './pocket';

const pocket = new Pocket();
const database = new Database();

export class App {
  static isSyncing = false;

  static async sync(): Promise<number> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    PerfLogger.start('App.sync');

    const items = await pocket.getAllArticles();

    // Cleanup
    await database.deleteAllArticles();
    await database.deleteAllTags();
    await database.deleteAllArticleTags();

    // Parse tags
    let tagIds = new Set<string>();
    items.forEach((item) => item.tags.forEach((tag) => tagIds.add(tag)));
    const tags = Array.from(tagIds).map((tagId) => ({
      id: tagId,
      value: tagId,
    }));

    const articleTagMaps: ArticleTagMap[] = [];
    items.forEach((item) => {
      item.tags.forEach((tag) =>
        articleTagMaps.push({ id: undefined, itemId: item.id, tagId: tag })
      );
    });

    // Store new data
    await database.addArticles(items);
    await database.addTags(tags);
    await database.addArticleTags(articleTagMaps);

    this.isSyncing = false;
    PerfLogger.stop('App.sync');

    return items.length;
  }
}
