<script>
    import { resolve } from "$app/paths";
    import ToolCard from "../components/ToolCard.svelte";
    import { base } from "#lib/paths.js";
    import { onMount } from "svelte";
    import { categories, tools, toolsIn } from "#lib/tools.js";
    import { getRecent, searchTools } from "#lib/search.js";
    import { favorites } from "#lib/favorites.svelte.js";

    const featuredSlugs = ["change-case", "html-escape", "word-counter", "json-formatter", "csv-to-json", "telegram"];
    const featured = featuredSlugs.map((slug) => tools.find((tool) => tool.slug === slug));

    let query = $state("");
    let recent = $state([]);

    onMount(() => {
        recent = getRecent()
            .map((path) => tools.find((tool) => tool.path === path))
            .filter(Boolean);
    });

    const results = $derived(query.trim() ? searchTools(tools, query, 60) : []);
    const favoriteTools = $derived(favorites.list.map((path) => tools.find((tool) => tool.path === path)).filter(Boolean));
</script>

<svelte:head>
    <title>Mools - Online Developer Tools</title>
    <meta
        name="description"
        content="Collection of useful online tools for developers including text processors, converters, and testing utilities."
    />
</svelte:head>

<div class="text-center py-4 mb-4">
    <div class="d-flex justify-content-center align-items-center mb-3">
        <img src="{base}/favicon.png" width="80" class="me-3" alt="Mools Logo" />
        <h1 class="display-4 mb-0">Mools</h1>
    </div>
    <p class="lead text-body-secondary mb-2">A collection of useful online tools for developers and power users</p>
    <p class="text-body-secondary">No registration required • Fast and private • Runs in your browser</p>
</div>

<div class="mx-auto mb-5" style="max-width: 36rem;">
    <label for="home-search" class="visually-hidden">Find a tool</label>
    <div class="input-group input-group-lg">
        <span class="input-group-text"><i class="bi bi-search"></i></span>
        <input id="home-search" class="form-control" type="search" placeholder="Find a tool, e.g. json, password, regex" autocomplete="off" bind:value={query} />
    </div>
    <div class="form-text text-center">Tip: press <kbd>Ctrl</kbd> <kbd>K</kbd> anywhere to search.</div>
</div>

{#if query.trim()}
    <section class="mb-5" aria-live="polite">
        <h2 class="h4 mb-3">{results.length} {results.length === 1 ? "tool" : "tools"} found</h2>
        <div class="row g-3">
            {#each results as tool (tool.path)}
                <div class="col-md-6 col-lg-4">
                    <ToolCard {tool} showCategory />
                </div>
            {:else}
                <p class="text-body-secondary">Nothing matches "{query}". Try a shorter word.</p>
            {/each}
        </div>
    </section>
{:else}
{#if favoriteTools.length}
    <section class="mb-5" aria-labelledby="favorites-heading">
        <h2 id="favorites-heading" class="h4 mb-3"><i class="bi bi-star-fill text-warning me-2"></i>Favorites</h2>
        <div class="row g-3">
            {#each favoriteTools.slice(0, 6) as tool (tool.path)}
                <div class="col-md-6 col-lg-4">
                    <ToolCard {tool} showCategory />
                </div>
            {/each}
        </div>
        {#if favoriteTools.length > 6}
            <p class="small text-body-secondary mt-2 mb-0">{favoriteTools.length - 6} more in the sidebar.</p>
        {/if}
    </section>
{/if}

{#if recent.length}
    <section class="mb-5">
        <h2 class="h4 mb-3"><i class="bi bi-clock-history me-2"></i>Recently used</h2>
        <div class="row g-3">
            {#each recent.slice(0, 3) as tool (tool.path)}
                <div class="col-md-6 col-lg-4">
                    <ToolCard {tool} showCategory />
                </div>
            {/each}
        </div>
    </section>
{/if}

<section class="mb-5">
    <h2 class="h4 mb-3"><i class="bi bi-star me-2"></i>Featured Tools</h2>
    <div class="row g-3">
        {#each featured as tool (tool.slug)}
            <div class="col-md-6 col-lg-4">
                <ToolCard {tool} showCategory />
            </div>
        {/each}
    </div>
</section>

<section class="mb-5">
    <h2 class="h4 mb-3"><i class="bi bi-grid me-2"></i>Tool Categories</h2>
    <div class="row g-3">
        {#each categories as category (category.id)}
            <div class="col-md-4">
                <a href={resolve(`/${category.id}/`)} class="text-decoration-none">
                    <div class="card h-100 category-card">
                        <div class="card-body text-center">
                            <div class="category-icon mb-3">
                                <i class="bi bi-{category.icon} fs-1"></i>
                            </div>
                            <h5 class="card-title">{category.name}</h5>
                            <p class="card-text text-body-secondary small mb-2">{category.description}</p>
                            <span class="badge bg-primary">{toolsIn(category.id).length} tools</span>
                        </div>
                    </div>
                </a>
            </div>
        {/each}
    </div>
</section>

{/if}

<section class="mb-5">
    <div class="card">
        <div class="card-body">
            <h3 class="h5 mb-3"><i class="bi bi-info-circle me-2"></i>About Mools</h3>
            <div class="row">
                <div class="col-md-8">
                    <p class="mb-3">
                        Mools is a collection of useful online tools designed for developers, content creators, and
                        anyone who works with text and data. All tools run entirely in your browser, so your data stays
                        private.
                    </p>
                    <div class="row">
                        <div class="col-sm-6">
                            <h6 class="fw-bold"><i class="bi bi-shield-check text-success me-2"></i>Privacy First</h6>
                            <p class="small text-body-secondary">All processing happens locally in your browser</p>
                        </div>
                        <div class="col-sm-6">
                            <h6 class="fw-bold"><i class="bi bi-lightning text-warning me-2"></i>Fast & Lightweight</h6>
                            <p class="small text-body-secondary">Optimized for speed and efficiency</p>
                        </div>
                        <div class="col-sm-6">
                            <h6 class="fw-bold"><i class="bi bi-phone text-primary me-2"></i>Mobile Friendly</h6>
                            <p class="small text-body-secondary">Works on all devices</p>
                        </div>
                        <div class="col-sm-6">
                            <h6 class="fw-bold"><i class="bi bi-code-square text-info me-2"></i>Open Source</h6>
                            <p class="small text-body-secondary">Built with modern web technologies</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 text-center">
                    <div class="stats-box">
                        <div class="mb-3">
                            <div class="stat-number h3 mb-0">{tools.length}</div>
                            <div class="text-body-secondary small">Tools Available</div>
                        </div>
                        <div class="mb-3">
                            <div class="stat-number h3 mb-0">{categories.length}</div>
                            <div class="text-body-secondary small">Categories</div>
                        </div>
                        <div>
                            <div class="stat-number h3 mb-0">100%</div>
                            <div class="text-body-secondary small">Free to Use</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    .category-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .category-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .category-icon {
        width: 80px;
        height: 80px;
        border-radius: 16px;
        background: var(--bs-primary-bg-subtle);
        color: var(--bs-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
    }

    .stats-box {
        background: var(--bs-tertiary-bg);
        border-radius: 12px;
        padding: 1.5rem;
    }

    .stat-number {
        color: var(--bs-primary);
        font-weight: bold;
    }
</style>
