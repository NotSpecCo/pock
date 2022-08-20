import type { Article, PocketArticle } from '../models';
import { AuthClient } from './authClient';
import { toArticle } from './mapper';

export class Pocket {
  async getAllArticles(): Promise<Article[]> {
    const url = AuthClient.buildApiUrl('/v3/get');

    const body = {
      detailType: 'simple',
      contentType: 'article',
      state: 'all',
    };

    const result = await AuthClient.httpPost<{ list: { [key: string]: PocketArticle } }>(
      url.toString(),
      body
    ).then((res) => Object.values(res.list).map((a) => toArticle(a)));

    return result;
  }
}
