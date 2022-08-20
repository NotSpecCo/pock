<script lang="ts">
  import Card from 'onyx-ui/components/card/Card.svelte';
  import CardContent from 'onyx-ui/components/card/CardContent.svelte';
  import CardHeader from 'onyx-ui/components/card/CardHeader.svelte';
  import ListItem from 'onyx-ui/components/list/ListItem.svelte';
  import Typography from 'onyx-ui/components/Typography.svelte';
  import View from 'onyx-ui/components/view/View.svelte';
  import ViewContent from 'onyx-ui/components/view/ViewContent.svelte';
  import { DataStatus, IconSize } from 'onyx-ui/enums';
  import { registerView, updateView } from 'onyx-ui/stores/view';
  import { getShortcutFromIndex } from 'onyx-ui/utils/getShortcutFromIndex';
  import { onMount } from 'svelte';
  import FaTag from 'svelte-icons/fa/FaTag.svelte';
  import { push } from 'svelte-spa-router';
  import { Tags } from '../services/tags';

  registerView({});

  const getTags = Tags.getAll(true);

  onMount(async () => {
    await getTags;
    updateView({ dataStatus: DataStatus.Loaded });
  });
</script>

<View>
  <ViewContent>
    <Card>
      <CardHeader title="Tags" />
      <CardContent>
        {#await getTags}
          <Typography align="center">Loading...</Typography>
        {:then tags}
          {#each tags as tag, i}
            <ListItem
              icon={FaTag}
              imageSize={IconSize.Smallest}
              primaryText={tag.value}
              secondaryText={`${tag.itemCount} articles`}
              navi={{
                itemId: tag.id,
                onSelect: () => push(`/tags/${tag.id}`),
                shortcutKey: getShortcutFromIndex(i),
              }}
            />
          {:else}
            <Typography align="center">No tags</Typography>
          {/each}
        {:catch error}
          <Typography align="center">Failed to load tags</Typography>
        {/await}
      </CardContent>
    </Card>
  </ViewContent>
</View>
