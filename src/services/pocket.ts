import type { Article, PocketArticle } from '../models';
import { AuthClient } from './authClient';
import { toArticle } from './mapper';

type Action = {
  action: 'add' | 'archive' | 'readd' | 'favorite' | 'unfavorite' | 'delete';
  item_id: number;
  time?: string;
};

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

  async archive(id: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: Action[] } = {
      actions: [
        {
          action: 'archive',
          item_id: Number(id),
        },
      ],
    };

    await AuthClient.httpPost<{ list: { [key: string]: PocketArticle } }>(url.toString(), body);
  }

  async unarchive(id: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: Action[] } = {
      actions: [
        {
          action: 'readd',
          item_id: Number(id),
        },
      ],
    };

    await AuthClient.httpPost<{ list: { [key: string]: PocketArticle } }>(url.toString(), body);
  }

  async favorite(id: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: Action[] } = {
      actions: [
        {
          action: 'favorite',
          item_id: Number(id),
        },
      ],
    };

    await AuthClient.httpPost<{ list: { [key: string]: PocketArticle } }>(url.toString(), body);
  }

  async unfavorite(id: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: Action[] } = {
      actions: [
        {
          action: 'unfavorite',
          item_id: Number(id),
        },
      ],
    };

    await AuthClient.httpPost<{ list: { [key: string]: PocketArticle } }>(url.toString(), body);
  }

  async delete(id: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: Action[] } = {
      actions: [
        {
          action: 'delete',
          item_id: Number(id),
        },
      ],
    };

    await AuthClient.httpPost<{ list: { [key: string]: PocketArticle } }>(url.toString(), body);
  }
}
