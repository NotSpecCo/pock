<script lang="ts">
  import Button from 'onyx-ui/components/buttons/Button.svelte';
  import Card from 'onyx-ui/components/card/Card.svelte';
  import CardContent from 'onyx-ui/components/card/CardContent.svelte';
  import Divider from 'onyx-ui/components/divider/Divider.svelte';
  import ListItem from 'onyx-ui/components/list/ListItem.svelte';
  import Typography from 'onyx-ui/components/Typography.svelte';
  import View from 'onyx-ui/components/view/View.svelte';
  import ViewContent from 'onyx-ui/components/view/ViewContent.svelte';
  import { DataStatus, IconSize } from 'onyx-ui/enums';
  import { Onyx } from 'onyx-ui/services';
  import { registerView, updateView } from 'onyx-ui/stores/view';
  import { onMount } from 'svelte';
  import FaTag from 'svelte-icons/fa/FaTag.svelte';
  import { push } from 'svelte-spa-router';
  import type { Article } from '../models';
  import { Articles } from '../services/articles';

  export let params: { articleId: string };

  registerView({});

  let getData: Promise<Article>;

  $: refresh();

  function refresh() {
    getData = Articles.getById(params.articleId).then((res) => {
      console.log('article', res);
      return res;
    });
  }

  onMount(async () => {
    await getData;
    updateView({ dataStatus: DataStatus.Loaded });
  });
</script>

<View>
  <ViewContent>
    <Card>
      <CardContent>
        {#await getData}
          <Typography align="center">Loading...</Typography>
        {:then article}
          {#if article}
            {#if article.imageUrl}
              <div class="photo" style="background-image: url({article.imageUrl})" />
            {/if}
            <Typography align="center" type="title">{article.title}</Typography>
            <Typography>{article.excerpt}</Typography>
            <Divider title="Tags" />
            {#each article.tags as tag, i}
              <ListItem
                icon={FaTag}
                imageSize={IconSize.Smallest}
                primaryText={tag}
                navi={{ itemId: `tag_${tag}`, onSelect: () => push(`/tags/${tag}`) }}
                contextMenu={{
                  title: `Tag: ${tag}`,
                  items: [
                    {
                      label: 'Remove Tag',
                      onSelect: async () => {
                        await Articles.removeTag(article.id, tag);
                        Onyx.contextMenu.close();
                      },
                    },
                  ],
                }}
              />
            {/each}
            <Button title="Add Tag" navi={{ itemId: 'btnAddTag' }} />
          {/if}
        {:catch error}
          <Typography align="center">Failed to load article</Typography>
        {/await}
      </CardContent>
    </Card>
  </ViewContent>
</View>

<style>
  .photo {
    width: 100%;
    height: 150px;
    background-size: cover;
    background-position: center;
  }
</style>
