<script lang="ts">
  import OnyxApp from 'onyx-ui/components/app/OnyxApp.svelte';
  import { Priority } from 'onyx-ui/enums';
  import { KeyManager, Onyx } from 'onyx-ui/services';
  import { onMount } from 'svelte';
  import FaSync from 'svelte-icons/fa/FaSync.svelte';
  import Router, { location, pop, replace } from 'svelte-spa-router';
  import AppMenu from './components/AppMenu.svelte';
  import AppSettings from './routes/AppSettings.svelte';
  import Home from './routes/Home.svelte';
  import LogIn from './routes/LogIn.svelte';
  import LogOut from './routes/LogOut.svelte';
  import Oauth from './routes/Oauth.svelte';
  import Recent from './routes/Recent.svelte';
  import Redirect from './routes/Redirect.svelte';
  import { Articles } from './services/articles';
  import { AuthClient } from './services/authClient';
  import { KaiAds } from './services/kaiAds';
  import { settings } from './stores/settings';

  console.log(`Env: ${process.env.NODE_ENV}`);

  const routes = {
    '/': Home,
    '/login': LogIn,
    '/logout': LogOut,
    '/oauth': Oauth,
    '/recent': Recent,
    '/settings/:cardId': AppSettings,
    '*': Redirect,
  };

  // TODO: Fix this in a better way
  document.addEventListener('keydown', (ev) => {
    if (
      ev.key === 'Backspace' &&
      $location !== '/' &&
      (ev.target as any).contentEditable !== 'true'
    ) {
      ev.preventDefault();
    }
  });
  const keyMan = KeyManager.subscribe(
    {
      onBackspace: () => {
        // If on the main screen, let KaiOS minimize the app
        if ($location === '/') {
          console.log('exit app');
          return false;
        }

        pop();
        return true;
      },
    },
    Priority.Low
  );

  onMount(async () => {
    KaiAds.startListening();

    if (!AuthClient.user) {
      replace(`/login`);
      return;
    }

    return;
    const count = await Articles.sync();
    console.log(`Synced ${count} articles`);

    Onyx.toaster.show({ icon: FaSync, type: 'success', title: `Synced ${count} articles` });
  });

  $: Onyx.settings.update($settings);
</script>

<OnyxApp>
  <AppMenu slot="app-menu" />
  <Router {routes} />
</OnyxApp>
