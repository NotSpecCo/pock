<script lang="ts">
  import Button from 'onyx-ui/components/buttons/Button.svelte';
  import Card from 'onyx-ui/components/card/Card.svelte';
  import CardContent from 'onyx-ui/components/card/CardContent.svelte';
  import CardHeader from 'onyx-ui/components/card/CardHeader.svelte';
  import Divider from 'onyx-ui/components/divider/Divider.svelte';
  import InputRow from 'onyx-ui/components/form/InputRow.svelte';
  import ListItem from 'onyx-ui/components/list/ListItem.svelte';
  import Typography from 'onyx-ui/components/Typography.svelte';
  import View from 'onyx-ui/components/view/View.svelte';
  import ViewContent from 'onyx-ui/components/view/ViewContent.svelte';
  import { DataStatus, IconSize } from 'onyx-ui/enums';
  import { Onyx } from 'onyx-ui/services';
  import { registerView, updateView } from 'onyx-ui/stores/view';
  import { onMount } from 'svelte';
  import FaCheck from 'svelte-icons/fa/FaCheck.svelte';
  import FaTag from 'svelte-icons/fa/FaTag.svelte';
  import MdError from 'svelte-icons/md/MdError.svelte';
  import type { Article } from '../models';
  import { Articles } from '../services/articles';
  import { Tags } from '../services/tags';

  export let params: { articleId: string };

  registerView({});

  let getData: Promise<{
    article: Article;
    availableTags: string[];
    assignedTags: string[];
  }>;

  let newTag = '';
  let addingNewTag = false;

  $: refresh(params.articleId);

  async function refresh(articleId: string) {
    const [tags, article] = await Promise.all([Tags.getAll(), Articles.getById(articleId)]);

    getData = Promise.resolve({
      article,
      availableTags: tags.filter((a) => !article.tags.includes(a.id)).map((a) => a.id),
      assignedTags: [...article.tags],
    });
  }

  async function saveNewTag() {
    if (!newTag) return;

    await Articles.addTag(params.articleId, newTag)
      .then(() => {
        Onyx.toaster.show({ icon: FaCheck, type: 'success', title: `Saved tag!` });
        newTag = '';
        addingNewTag = false;
        refresh(params.articleId);
      })
      .catch((err) => {
        console.error('Save failed!', err);
        Onyx.toaster.show({ icon: MdError, type: 'error', title: `Save failed!` });
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
      <CardHeader title="Manage Tags" />
      <CardContent>
        {#await getData}
          <Typography align="center">Loading...</Typography>
        {:then data}
          {#if data}
            {#if data.article.imageUrl}
              <div class="photo" style="background-image: url({data.article.imageUrl})" />
            {/if}
            <Typography align="center" type="title">{data.article.title}</Typography>
            <Divider title="Assigned Tags" />
            {#each data.assignedTags as tag}
              <ListItem
                icon={FaTag}
                imageSize={IconSize.Smallest}
                primaryText={tag}
                navi={{ itemId: `tag_${tag}` }}
                contextMenu={{
                  title: `Tag: ${tag}`,
                  items: [
                    {
                      label: 'Remove Tag',
                      onSelect: async () => {
                        await Articles.removeTag(params.articleId, tag);
                        await refresh(params.articleId);
                        Onyx.contextMenu.close();
                      },
                    },
                  ],
                }}
              />
            {/each}
            <Divider title="Available Tags" />
            {#each data.availableTags as tag}
              <ListItem
                icon={FaTag}
                imageSize={IconSize.Smallest}
                primaryText={tag}
                navi={{ itemId: `tag_${tag}` }}
                contextMenu={{
                  title: `Tag: ${tag}`,
                  items: [
                    {
                      label: 'Assign Tag',
                      onSelect: async () => {
                        await Articles.addTag(params.articleId, tag);
                        await refresh(params.articleId);
                        Onyx.contextMenu.close();
                      },
                    },
                  ],
                }}
              />
            {/each}
            {#if addingNewTag}
              <InputRow
                icon={FaTag}
                value={newTag}
                placeholder="New tag"
                align="left"
                onChange={(val) => (newTag = val)}
                onSubmit={saveNewTag}
              />
            {/if}
            {#if addingNewTag}
              <Button
                title="Cancel"
                navi={{
                  itemId: 'btnToggleAdd',
                  onSelect: () => {
                    newTag = '';
                    addingNewTag = false;
                  },
                }}
              />
            {:else}
              <Button
                title="Add Tag"
                navi={{
                  itemId: 'btnToggleAdd',
                  onSelect: () => {
                    newTag = '';
                    addingNewTag = true;
                  },
                }}
              />
            {/if}
          {/if}
        {:catch error}
          <Typography align="center">Failed to load data</Typography>
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
