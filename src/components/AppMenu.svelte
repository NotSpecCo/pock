<script lang="ts">
  import Divider from 'onyx-ui/components/divider/Divider.svelte';
  import ListItem from 'onyx-ui/components/list/ListItem.svelte';
  import NavGroup from 'onyx-ui/components/nav/NavGroup.svelte';
  import { IconSize, ViewState } from 'onyx-ui/enums';
  import { Onyx } from 'onyx-ui/services';
  import { updateView } from 'onyx-ui/stores/view';
  import { getShortcutFromIndex } from 'onyx-ui/utils/getShortcutFromIndex';
  import FaArchive from 'svelte-icons/fa/FaArchive.svelte';
  import FaRegClock from 'svelte-icons/fa/FaRegClock.svelte';
  import FaRegStar from 'svelte-icons/fa/FaRegStar.svelte';
  import FaSignInAlt from 'svelte-icons/fa/FaSignInAlt.svelte';
  import FaTags from 'svelte-icons/fa/FaTags.svelte';
  import IoIosSettings from 'svelte-icons/io/IoIosSettings.svelte';
  import { push } from 'svelte-spa-router';
  import { AuthClient } from '../services/authClient';

  let user = AuthClient.user;

  type MenuItem = {
    id: string;
    text: string;
    route: string;
    icon: any | null;
  };
  const items: MenuItem[] = user
    ? [
        { id: 'recent', text: 'Recent', route: `/filter/recent`, icon: FaRegClock },
        { id: 'favorites', text: 'Favorites', route: `/filter/favorites`, icon: FaRegStar },
        { id: 'archive', text: 'Archive', route: `/filter/archive`, icon: FaArchive },
        { id: 'tags', text: 'View Tags', route: `/tags`, icon: FaTags },
        { id: 'settings', text: 'Settings', route: `/settings/display`, icon: IoIosSettings },
      ]
    : [{ id: 'login', text: 'Log In', route: '/login', icon: FaSignInAlt }];
</script>

<NavGroup groupId="app-menu">
  <div class="header">
    <img class="logo" src="/images/icon_112.png" alt="" />
    <div class="app-name">Pock</div>
  </div>
  <div class="scroller" data-nav-scroller>
    <Divider title="Filters" />
    {#each items.slice(0, 3) as item, i}
      <ListItem
        icon={item.icon}
        imageSize={IconSize.Smallest}
        primaryText={item.text}
        navi={{
          itemId: item.id,
          shortcutKey: getShortcutFromIndex(i),
          onSelect: () => {
            Onyx.appMenu.close();
            if (window.location.hash.startsWith(`#${item.route}`)) {
              updateView({ viewing: ViewState.Card });
              return;
            }
            push(item.route);
          },
        }}
      />
    {/each}
    <Divider title="Tags" />
    {#each items.slice(3, 4) as item, i}
      <ListItem
        icon={item.icon}
        imageSize={IconSize.Smallest}
        primaryText={item.text}
        navi={{
          itemId: item.id,
          shortcutKey: getShortcutFromIndex(i + 3),
          onSelect: () => {
            Onyx.appMenu.close();
            if (window.location.hash.startsWith(`#${item.route}`)) {
              updateView({ viewing: ViewState.Card });
              return;
            }
            push(item.route);
          },
        }}
      />
    {/each}
    <Divider title="System" />
    {#each items.slice(4) as item, i}
      <ListItem
        icon={item.icon}
        imageSize={IconSize.Smallest}
        primaryText={item.text}
        navi={{
          itemId: item.id,
          shortcutKey: getShortcutFromIndex(i + 4),
          onSelect: () => {
            Onyx.appMenu.close();
            if (window.location.hash.startsWith(`#${item.route}`)) {
              updateView({ viewing: ViewState.Card });
              return;
            }
            push(item.route);
          },
        }}
      />
    {/each}
  </div>
</NavGroup>

<style>
  :global([data-nav-group-id='app-menu']) {
    border-radius: 0 var(--radius) var(--radius) 0;
    background-color: var(--card-color);
    color: var(--text-color);
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .header {
    padding: 10px;
    font-weight: var(--bold-font-weight);
    color: var(--accent-color);
    display: flex;
    align-items: center;
    font-size: 1.75rem;
  }
  .header > .app-name {
    margin-left: 5px;
    flex: 1;
  }
  .scroller {
    overflow-y: auto;
    flex: 1;
  }
  .logo {
    height: 28px;
    width: 28px;
  }
</style>
