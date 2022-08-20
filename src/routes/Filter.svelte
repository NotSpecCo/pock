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
  import { registerView, updateView } from 'onyx-ui/stores/view';
  import { onMount } from 'svelte';
  import { params } from 'svelte-spa-router';
  import type { Article } from '../models';
  import { Articles } from '../services/articles';

  type Filter = 'recent' | 'archived' | 'favorites' | 'unknown';

  registerView({});

  let title = '';
  let getArticles: Promise<Article[]>;

  $: {
    const filterId: Filter = ($params?.filterId as Filter) ?? 'unknown';
    switch (filterId) {
      case 'archived':
        title = 'Archived';
        getArticles = Articles.query({ isArchived: 1 }, { sortKey: 'updatedAt', sortDir: 'desc' });
        break;
      case 'favorites':
        title = 'Favorites';
        getArticles = Articles.query(
          { isFavorite: 1 },
          { sortKey: 'favoritedAt', sortDir: 'desc' }
        );
        break;
      case 'recent':
        title = 'Recent';
        getArticles = Articles.query({}, { sortKey: 'updatedAt', sortDir: 'desc' });
        break;
      default:
        getArticles = Promise.resolve([]);
    }
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
              accentText={formatDistanceToNowStrict(new Date(article.updatedAt), {
                addSuffix: true,
              })}
              navi={{ itemId: article.id }}
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
