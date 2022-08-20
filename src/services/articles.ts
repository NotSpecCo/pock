import type { Article } from '../models';
import { Database } from './database';
import { Pocket } from './pocket';

const pocket = new Pocket();
const database = new Database();

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
}
