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

  type Filter = 'recent' | 'archive' | 'favorites';

  registerView({});

  let title = '';
  let accentTextKey: 'createdAt' | 'updatedAt' | 'favoritedAt' = 'createdAt';
  let getArticles: Promise<Article[]>;

  $: getData($params?.filterId as Filter);

  async function getData(filterId?: Filter) {
    switch (filterId) {
      case 'archive':
        title = 'Archive';
        accentTextKey = 'updatedAt';
        getArticles = Articles.query({ isArchived: 1 }, { sortKey: 'updatedAt', sortDir: 'desc' });
        break;
      case 'favorites':
        title = 'Favorites';
        accentTextKey = 'favoritedAt';
        getArticles = Articles.query(
          { isFavorite: 1, isArchived: 0 },
          { sortKey: 'favoritedAt', sortDir: 'desc' }
        );
        break;
      case 'recent':
        title = 'Recent';
        accentTextKey = 'createdAt';
        getArticles = Articles.query({ isArchived: 0 }, { sortKey: 'createdAt', sortDir: 'desc' });
        break;
      default:
        getArticles = Promise.resolve([]);
    }
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
          getData($params.filterId as Filter);
          Onyx.contextMenu.close();
        },
      });
    } else {
      menu.items.push({
        label: 'Archive',
        onSelect: async () => {
          await Articles.archive(article.id);
          getData($params.filterId as Filter);
          Onyx.contextMenu.close();
        },
      });
    }

    if (article.isFavorite) {
      menu.items.push({
        label: 'Unfavorite',
        onSelect: async () => {
          await Articles.unfavorite(article.id);
          getData($params.filterId as Filter);
          Onyx.contextMenu.close();
        },
      });
    } else {
      menu.items.push({
        label: 'Favorite',
        onSelect: async () => {
          await Articles.favorite(article.id);
          getData($params.filterId as Filter);
          Onyx.contextMenu.close();
        },
      });
    }

    menu.items.push({
      label: 'Delete',
      onSelect: async () => {
        await Articles.delete(article.id);
        getData($params.filterId as Filter);
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
      <CardHeader {title} />
      <CardContent>
        {#await getArticles}
          <Typography align="center">Loading...</Typography>
        {:then articles}
          {#each articles as article}
            <ListItem
              primaryText={article.title}
              secondaryText={article.url}
              accentText={formatDistanceToNowStrict(new Date(article[accentTextKey]), {
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
