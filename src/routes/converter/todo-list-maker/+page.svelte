<script>
    import { onMount } from "svelte";

    const KEY = "mools-todo";

    let items = $state([]);
    let draft = $state("");
    let loaded = false;

    onMount(() => {
        try {
            items = JSON.parse(localStorage.getItem(KEY) ?? "[]");
        } catch {
            items = [];
        }
        loaded = true;
    });

    $effect(() => {
        const snapshot = JSON.stringify(items);
        if (!loaded) return;
        try {
            localStorage.setItem(KEY, snapshot);
        } catch {
            // Storage can be unavailable; the list then only lives for this visit.
        }
    });

    const add = () => {
        const text = draft.trim();
        if (!text) return;
        items.push({ id: crypto.randomUUID(), text, done: false });
        draft = "";
    };

    const remaining = $derived(items.filter((item) => !item.done).length);
</script>

<svelte:head>
    <title>To Do List Maker | Mools</title>
</svelte:head>

<h1>To Do List Maker</h1>
<p class="text-body-secondary mb-3">A simple to-do list saved in this browser.</p>

<div class="card p-3">
    <form class="input-group mb-3" onsubmit={(e) => { e.preventDefault(); add(); }}>
        <input class="form-control" placeholder="What needs to be done?" aria-label="New task" bind:value={draft} />
        <button class="btn btn-primary" type="submit">Add</button>
    </form>

    <ul class="list-group mb-3">
        {#each items as item (item.id)}
            <li class="list-group-item d-flex align-items-center gap-2">
                <input class="form-check-input mt-0" type="checkbox" aria-label="Done" bind:checked={item.done} />
                <span class="me-auto" class:text-decoration-line-through={item.done} class:text-body-secondary={item.done}>{item.text}</span>
                <button class="btn btn-sm btn-outline-danger" type="button" aria-label="Delete task" onclick={() => (items = items.filter((i) => i.id !== item.id))}>
                    <i class="bi bi-trash"></i>
                </button>
            </li>
        {:else}
            <li class="list-group-item text-body-secondary">No tasks yet.</li>
        {/each}
    </ul>

    <div class="d-flex align-items-center gap-2">
        <span class="text-body-secondary small me-auto">{remaining} of {items.length} remaining</span>
        <button class="btn btn-sm btn-outline-secondary" type="button" disabled={!items.some((i) => i.done)} onclick={() => (items = items.filter((i) => !i.done))}>
            Clear completed
        </button>
    </div>
</div>
