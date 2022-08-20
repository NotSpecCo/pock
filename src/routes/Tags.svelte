<script lang="ts">
  import Card from 'onyx-ui/components/card/Card.svelte';
  import CardContent from 'onyx-ui/components/card/CardContent.svelte';
  import CardHeader from 'onyx-ui/components/card/CardHeader.svelte';
  import ListItem from 'onyx-ui/components/list/ListItem.svelte';
  import Typography from 'onyx-ui/components/Typography.svelte';
  import View from 'onyx-ui/components/view/View.svelte';
  import ViewContent from 'onyx-ui/components/view/ViewContent.svelte';
  import { DataStatus, IconSize } from 'onyx-ui/enums';
  import { Onyx } from 'onyx-ui/services';
  import { registerView, updateView } from 'onyx-ui/stores/view';
  import { getShortcutFromIndex } from 'onyx-ui/utils/getShortcutFromIndex';
  import { onMount } from 'svelte';
  import FaTag from 'svelte-icons/fa/FaTag.svelte';
  import { push } from 'svelte-spa-router';
  import type { Tag } from '../models';
  import { Tags } from '../services/tags';

  registerView({});

  let getData: Promise<Tag[]> = Tags.getAll(true);

  async function refresh() {
    getData = Tags.getAll(true);
  }

  onMount(async () => {
    refresh();
    await getData;
    updateView({ dataStatus: DataStatus.Loaded });
  });
</script>

<View>
  <ViewContent>
    <Card>
      <CardHeader title="Tags" />
      <CardContent>
        {#await getData}
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
              contextMenu={{
                title: `Tag: ${tag.id}`,
                items: [
                  {
                    label: 'Delete Tag',
                    onSelect: async () => {
                      Onyx.contextMenu.close();
                      Onyx.dialog.show({
                        title: 'Confirm',
                        body: 'Are you sure you want to delete this tag? It will be removed from all articles as well.',
                        actions: {
                          left: {
                            label: 'Cancel',
                            fn: () => Onyx.dialog.close(),
                          },
                          center: {
                            label: 'Delete',
                            fn: async () => {
                              await Tags.delete(tag.id);
                              await refresh();
                            },
                          },
                        },
                      });
                    },
                  },
                ],
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
