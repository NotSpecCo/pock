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
  import { Articles } from '../services/articles';

  registerView({});

  const getArticles = Articles.query({}, { sortKey: 'updatedAt', sortDir: 'desc' });

  onMount(async () => {
    await getArticles;
    updateView({ dataStatus: DataStatus.Loaded });
  });
</script>

<View>
  <ViewContent>
    <Card>
      <CardHeader title="Recent" />
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
