<script>
    import ToolCard from './ToolCard.svelte';
    import { categories, toolsIn } from '#lib/tools.js';

    let { id } = $props();

    const category = $derived(categories.find((c) => c.id === id));
    const list = $derived(toolsIn(id));
</script>

<svelte:head>
    <title>{category.name} | Mools</title>
</svelte:head>

<div class="d-flex align-items-center mb-4">
    <div class="category-icon me-3 flex-shrink-0">
        <i class="bi bi-{category.icon} fs-1"></i>
    </div>
    <div>
        <h1 class="mb-1">{category.name}</h1>
        <p class="text-body-secondary mb-0">{category.description}</p>
    </div>
</div>

<div class="row g-3">
    {#each list as tool (tool.slug)}
        <div class="col-md-6 col-lg-4">
            <ToolCard {tool} />
        </div>
    {/each}
</div>

<style>
    .category-icon {
        width: 80px;
        height: 80px;
        border-radius: 16px;
        background: var(--bs-primary-bg-subtle);
        color: var(--bs-primary);
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
