<script>
    import { favorites } from "#lib/favorites.svelte.js";
    import { announce } from "#lib/announce.svelte.js";
    import { tools } from "#lib/tools.js";

    let { path } = $props();

    const active = $derived(favorites.has(path));

    const toggle = () => {
        const title = tools.find((t) => t.path === path)?.title ?? "This tool";
        favorites.toggle(path);
        announce(favorites.has(path) ? `${title} added to favorites` : `${title} removed from favorites`);
    };
</script>

<button
    type="button"
    class="btn btn-sm {active ? 'btn-warning' : 'btn-outline-secondary'}"
    aria-pressed={active}
    aria-label={active ? "Remove from favorites" : "Add to favorites"}
    title={active ? "Remove from favorites" : "Add to favorites"}
    onclick={toggle}
>
    <i class="bi {active ? 'bi-star-fill' : 'bi-star'}" aria-hidden="true"></i>
    <span class="d-none d-sm-inline ms-1">{active ? "Favorite" : "Add to favorites"}</span>
</button>
