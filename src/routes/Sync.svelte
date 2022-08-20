<script lang="ts">
  import Button from 'onyx-ui/components/buttons/Button.svelte';
  import Card from 'onyx-ui/components/card/Card.svelte';
  import CardContent from 'onyx-ui/components/card/CardContent.svelte';
  import CardHeader from 'onyx-ui/components/card/CardHeader.svelte';
  import Icon from 'onyx-ui/components/icon/Icon.svelte';
  import Typography from 'onyx-ui/components/Typography.svelte';
  import View from 'onyx-ui/components/view/View.svelte';
  import ViewContent from 'onyx-ui/components/view/ViewContent.svelte';
  import { Color, DataStatus } from 'onyx-ui/enums';
  import { Onyx } from 'onyx-ui/services';
  import { registerView, updateView } from 'onyx-ui/stores/view';
  import { onMount } from 'svelte';
  import FaSync from 'svelte-icons/fa/FaSync.svelte';
  import MdError from 'svelte-icons/md/MdError.svelte';
  import { replace } from 'svelte-spa-router';
  import { App } from '../services/app';

  let syncStatus: 'init' | 'inProgress' | 'success' | 'error' = 'init';

  registerView({});

  async function sync() {
    if (syncStatus === 'inProgress') return;

    syncStatus = 'inProgress';

    await App.sync()
      .then((count) => {
        console.log(`Synced ${count} articles`);
        syncStatus = 'success';
        Onyx.toaster.show({ icon: FaSync, type: 'success', title: `Synced ${count} articles` });
        replace('/filter/recent');
      })
      .catch((err) => {
        console.error('Sync failed!', err);
        syncStatus = 'error';
        Onyx.toaster.show({ icon: MdError, type: 'error', title: `Sync failed!` });
      });
  }

  onMount(async () => {
    await sync();
    updateView({ dataStatus: DataStatus.Loaded });
  });
</script>

<View>
  <ViewContent>
    <Card>
      <CardHeader title="Pock" />
      <CardContent>
        <div class="logo">
          <img src="/images/icon_128.png" alt="" />
        </div>
        {#if syncStatus === 'inProgress'}
          <Typography align="center">Syncing with Pocket...</Typography>
          <div class="container">
            <div class="spinner">
              <Icon size={38} color={Color.Accent}><FaSync /></Icon>
            </div>
          </div>
        {:else if syncStatus === 'success'}
          <Typography align="center">Synced with Pocket!</Typography>
        {:else if syncStatus === 'error'}
          <Typography align="center">Failed to sync!</Typography>
          <Button
            title="Sync Again"
            color={Color.Accent}
            navi={{ itemId: 'sync', onSelect: sync }}
          />
        {/if}
      </CardContent>
    </Card>
  </ViewContent>
</View>

<style>
  .logo {
    text-align: center;
    margin: 15px 0;
  }
  .logo > img {
    height: 72px;
    width: 72px;
  }

  .container {
    display: flex;
    justify-content: center;
    padding: 20px;
  }

  .spinner {
    height: 38px;
    width: 38px;
    -moz-animation-name: spin;
    -moz-animation-duration: 3000ms;
    -moz-animation-iteration-count: infinite;
    -moz-animation-timing-function: linear;

    animation-name: spin;
    animation-duration: 3000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

  @-moz-keyframes spin {
    from {
      -moz-transform: rotate(0deg);
    }
    to {
      -moz-transform: rotate(360deg);
    }
  }
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
