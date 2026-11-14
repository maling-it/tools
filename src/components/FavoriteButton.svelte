<script>
    import { favorites } from "#lib/favorites.svelte.js";

    let { path } = $props();

    const active = $derived(favorites.has(path));
</script>

<button
    type="button"
    class="btn btn-sm {active ? 'btn-warning' : 'btn-outline-secondary'}"
    aria-pressed={active}
    aria-label={active ? "Remove from favorites" : "Add to favorites"}
    title={active ? "Remove from favorites" : "Add to favorites"}
    onclick={() => favorites.toggle(path)}
>
    <i class="bi {active ? 'bi-star-fill' : 'bi-star'}" aria-hidden="true"></i>
    <span class="d-none d-sm-inline ms-1">{active ? "Favorite" : "Add to favorites"}</span>
</button>
