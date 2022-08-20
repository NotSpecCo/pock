import type { Article, PocketArticle } from '../models';
import { AuthClient } from './authClient';
import { toArticle } from './mapper';

type ArticleAction = {
  action: 'add' | 'archive' | 'readd' | 'favorite' | 'unfavorite' | 'delete';
  item_id: number;
  time?: string;
};

type TagAction = {
  action: 'tags_add' | 'tags_remove' | 'tags_replace' | 'tags_clear' | 'tag_rename' | 'tag_delete';
  item_id?: string;
  old_tag?: string;
  new_tag?: string;
  tag?: string;
  tags?: string;
  time?: string;
};

export class Pocket {
  // Articles

  async getAllArticles(): Promise<Article[]> {
    const url = AuthClient.buildApiUrl('/v3/get');
    const body = {
      detailType: 'complete',
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
    const body: { actions: ArticleAction[] } = {
      actions: [
        {
          action: 'archive',
          item_id: Number(id),
        },
      ],
    };

    await AuthClient.httpPost(url.toString(), body);
  }

  async unarchive(id: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: ArticleAction[] } = {
      actions: [
        {
          action: 'readd',
          item_id: Number(id),
        },
      ],
    };

    await AuthClient.httpPost(url.toString(), body);
  }

  async favorite(id: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: ArticleAction[] } = {
      actions: [
        {
          action: 'favorite',
          item_id: Number(id),
        },
      ],
    };

    await AuthClient.httpPost(url.toString(), body);
  }

  async unfavorite(id: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: ArticleAction[] } = {
      actions: [
        {
          action: 'unfavorite',
          item_id: Number(id),
        },
      ],
    };

    await AuthClient.httpPost(url.toString(), body);
  }

  async delete(id: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: ArticleAction[] } = {
      actions: [
        {
          action: 'delete',
          item_id: Number(id),
        },
      ],
    };

    await AuthClient.httpPost(url.toString(), body);
  }

  // Tags

  async addTags(itemId: string, tags: string[]): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: TagAction[] } = {
      actions: [
        {
          action: 'tags_add',
          item_id: itemId,
          tags: tags.join(','),
        },
      ],
    };

    await AuthClient.httpPost(url.toString(), body);
  }

  async removeTags(itemId: string, tags: string[]): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: TagAction[] } = {
      actions: [
        {
          action: 'tags_remove',
          item_id: itemId,
          tags: tags.join(','),
        },
      ],
    };

    await AuthClient.httpPost(url.toString(), body);
  }

  async replaceTags(itemId: string, tags: string[]): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: TagAction[] } = {
      actions: [
        {
          action: 'tags_replace',
          item_id: itemId,
          tags: tags.join(','),
        },
      ],
    };

    await AuthClient.httpPost(url.toString(), body);
  }

  async clearTags(itemId: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: TagAction[] } = {
      actions: [
        {
          action: 'tags_clear',
          item_id: itemId,
        },
      ],
    };

    await AuthClient.httpPost(url.toString(), body);
  }

  async renameTag(oldTag: string, newTag: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: TagAction[] } = {
      actions: [
        {
          action: 'tag_rename',
          old_tag: oldTag,
          new_tag: newTag,
        },
      ],
    };

    await AuthClient.httpPost(url.toString(), body);
  }

  async deleteTag(tag: string): Promise<void> {
    const url = AuthClient.buildApiUrl('/v3/send');
    const body: { actions: TagAction[] } = {
      actions: [
        {
          action: 'tag_delete',
          tag: tag,
        },
      ],
    };

    await AuthClient.httpPost(url.toString(), body);
  }
}
