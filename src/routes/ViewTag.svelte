<script lang="ts">
  import { formatDistanceToNowStrict } from 'date-fns';
  import Card from 'onyx-ui/components/card/Card.svelte';
  import CardContent from 'onyx-ui/components/card/CardContent.svelte';
  import CardHeader from 'onyx-ui/components/card/CardHeader.svelte';
  import ListItem from 'onyx-ui/components/list/ListItem.svelte';
  import Typography from 'onyx-ui/components/Typography.svelte';
  import View from 'onyx-ui/components/view/View.svelte';
  import ViewContent from 'onyx-ui/components/view/ViewContent.svelte';
  import { DataStatus } from 'onyx-ui/enums';
  import type { ContextMenu } from 'onyx-ui/models';
  import { Onyx } from 'onyx-ui/services';
  import { registerView, updateView } from 'onyx-ui/stores/view';
  import { onMount } from 'svelte';
  import { params, push } from 'svelte-spa-router';
  import type { Article } from '../models';
  import { Articles } from '../services/articles';

  registerView({});

  let getArticles: Promise<Article[]>;

  $: getData($params?.tagId);

  async function getData(tagId?: string) {
    if (!tagId) {
      getArticles = Promise.resolve([]);
      return;
    }

    getArticles = Articles.query({ tagId }, { sortKey: 'updatedAt', sortDir: 'desc' });
  }

  function buildContextMenu(article: Article): ContextMenu {
    const menu: ContextMenu = {
      title: 'Article',
      items: [],
    };

    if (article.isArchived) {
      menu.items.push({
        label: 'Unarchive',
        onSelect: async () => {
          await Articles.unarchive(article.id);
          getData($params.filterId);
          Onyx.contextMenu.close();
        },
      });
    } else {
      menu.items.push({
        label: 'Archive',
        onSelect: async () => {
          await Articles.archive(article.id);
          getData($params.filterId);
          Onyx.contextMenu.close();
        },
      });
    }

    if (article.isFavorite) {
      menu.items.push({
        label: 'Unfavorite',
        onSelect: async () => {
          await Articles.unfavorite(article.id);
          getData($params.filterId);
          Onyx.contextMenu.close();
        },
      });
    } else {
      menu.items.push({
        label: 'Favorite',
        onSelect: async () => {
          await Articles.favorite(article.id);
          getData($params.filterId);
          Onyx.contextMenu.close();
        },
      });
    }

    menu.items.push({
      label: 'Delete',
      onSelect: async () => {
        await Articles.delete(article.id);
        getData($params.filterId);
        Onyx.contextMenu.close();
      },
    });

    return menu;
  }

  onMount(async () => {
    await getArticles;
    updateView({ dataStatus: DataStatus.Loaded });
  });
</script>

<View>
  <ViewContent>
    <Card>
      <CardHeader title={`Tag: ${$params?.tagId}`} />
      <CardContent>
        {#await getArticles}
          <Typography align="center">Loading...</Typography>
        {:then articles}
          {#each articles as article}
            <ListItem
              primaryText={article.title}
              secondaryText={article.url}
              accentText={formatDistanceToNowStrict(new Date(article.updatedAt), {
                addSuffix: true,
              })}
              navi={{ itemId: article.id, onSelect: () => push(`/articles/${article.id}`) }}
              contextMenu={buildContextMenu(article)}
            />
          {:else}
            <Typography align="center">No articles</Typography>
          {/each}
        {:catch error}
          <Typography align="center">Failed to load articles</Typography>
        {/await}
      </CardContent>
    </Card>
  </ViewContent>
</View>
