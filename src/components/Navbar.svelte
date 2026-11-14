<script>
    import ThemeSwitcher from "./ThemeSwitcher.svelte";
    import CoreSwitcher from "./CoreSwitcher.svelte";
    import { page } from "$app/state";
    import { base } from '#lib/paths.js';
    import { onMount } from "svelte";
    import { categories, tools } from "#lib/tools.js";

    let { onsearch } = $props();

    let repoData = $state();

    const crumbs = $derived.by(() => {
        const path = page.url.pathname.slice(base.length).replace(/^\/|\/$/g, "");
        if (!path) return [];
        const [first, second] = path.split("/");
        const category = categories.find((c) => c.id === first);
        const tool = tools.find((t) => t.category === first && t.slug === second);
        const items = [{ name: "Home", href: `${base}/` }];
        if (category) {
            items.push({ name: category.name, href: second ? `${base}/${category.id}/` : null });
            if (tool) items.push({ name: tool.title, href: null });
        } else {
            items.push({ name: first[0].toUpperCase() + first.slice(1), href: null });
        }
        return items;
    });

    // The GitHub API allows few anonymous requests per hour, so the repository info is cached for 30 minutes.
    const CACHE_KEY = "mools-repo";

    onMount(async () => {
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null");
            if (cached && Date.now() - cached.time < 30 * 60 * 1000) {
                repoData = cached.data;
                return;
            }
        } catch {
            // Ignore unreadable cache and fetch fresh data.
        }
        try {
            const response = await fetch("https://api.github.com/repos/maling-it/tools");
            if (!response.ok) return;
            const data = await response.json();
            repoData = data;
            try {
                localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data: { html_url: data.html_url, stargazers_count: data.stargazers_count } }));
            } catch {
                // Storage can be unavailable; the next page load simply fetches again.
            }
        } catch {
            // Offline or blocked: the star count is optional, so just leave it out.
        }
    });
</script>

<nav class="navbar navbar-expand-md mools-navbar sticky-top">
    <div class="container-md px-3 px-sm-4 px-xl-5 py-1 justify-content-start">
        <div class="btn-group me-3 d-lg-none">
            <button
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#sidebar"
                class="btn btn-secondary btn-square"
                aria-label="Toggle sidebar"
            >
                <i class="bi bi-layout-sidebar" aria-hidden="true"></i>
            </button>

            <ThemeSwitcher align="start" />
        </div>
        <a
            href="{base}/"
            class="navbar-brand d-flex align-items-center d-lg-none ms-auto ms-md-0"
        >
            <img
                src="{base}/favicon.png"
                alt="Logo"
                width="28"
                height="28"
                class="d-block flex-shrink-0 me-1"
            />
            Mools
        </a>
        <nav class="d-none d-lg-block text-truncate" aria-label="Breadcrumb">
            <ol class="breadcrumb mb-0 flex-nowrap">
                {#each crumbs as crumb, index (index)}
                    <li class="breadcrumb-item text-nowrap" class:active={!crumb.href} aria-current={!crumb.href ? "page" : undefined}>
                        {#if crumb.href}<a class="text-decoration-none" href={crumb.href}>{crumb.name}</a>{:else}{crumb.name}{/if}
                    </li>
                {/each}
            </ol>
        </nav>
        <div class="btn-group ms-auto d-md-none">
            <button type="button" class="btn btn-secondary btn-square" aria-label="Search tools" onclick={() => onsearch?.()}>
                <i class="bi bi-search" aria-hidden="true"></i>
            </button>
            <div class="btn-group">
                <CoreSwitcher />
            </div>
            <button
                class="btn btn-secondary btn-square"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#mools-navbar-collapse"
                aria-controls="mools-navbar-collapse"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <i class="bi bi-list" aria-hidden="true"></i>
            </button>
        </div>
        <div class="collapse navbar-collapse" id="mools-navbar-collapse">
            <div class="navbar-nav ms-auto "></div>
            <div
                class="d-flex align-items-center justify-content-center"
            >
                <button type="button" class="btn btn-secondary me-2 d-none d-md-flex align-items-center" aria-label="Search tools" onclick={() => onsearch?.()}>
                    <i class="bi bi-search" aria-hidden="true"></i>
                    <span class="ms-2 d-none d-xl-inline">Search</span>
                    <kbd class="ms-2 d-none d-xl-inline">Ctrl K</kbd>
                </button>
                <div class="dropdown me-2 d-none d-md-inline-block">
                    <CoreSwitcher />
                </div>
                <div class="btn-group p-1 me-1">
                    {#if repoData}
                        <a
                            href={repoData.html_url}
                            class="btn btn-secondary flex-grow-1 d-flex align-items-center flex-nowrap text-start"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <i class="bi bi-github flex-shrink-0"
                                style="width: 20px;"
                                aria-hidden="true"></i>
                            Star
                        </a>
                        <a
                            href="{repoData.html_url}/stargazers"
                            class="btn btn-secondary flex-grow-1 text-nowrap"
                            id="github-stars-count"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {repoData.stargazers_count}</a
                        >
                    {/if}
                </div>
            </div>
        </div>
    </div>
</nav>
