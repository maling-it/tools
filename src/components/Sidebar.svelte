<script>
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import { afterNavigate } from "$app/navigation";
    import ThemeSwitcher from "./ThemeSwitcher.svelte";
    import { onMount, untrack } from "svelte";
    import { categories, tools, toolsIn } from "#lib/tools.js";
    import { base } from "#lib/paths.js";

    const OPEN_KEY = "mools-sidebar-open";

    let query = $state("");
    let searchInput = $state();
    // Ids of expanded groups; every group is open while searching.
    let openGroups = $state(["start"]);
    let loaded = false;

    onMount(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(OPEN_KEY) ?? "null");
            if (Array.isArray(stored)) openGroups = stored;
        } catch {
            // Ignore unreadable saved state and keep the default.
        }
        loaded = true;
    });

    $effect(() => {
        const snapshot = JSON.stringify(openGroups);
        if (!loaded) return;
        try {
            localStorage.setItem(OPEN_KEY, snapshot);
        } catch {
            // Storage can be unavailable; the layout then only lasts for this visit.
        }
    });

    // Always expand the group of the page being viewed.
    $effect(() => {
        const current = tools.find((t) => page.url.pathname === `${base}${t.path}/`);
        // Only react to navigation, so the user can still collapse the active group afterwards.
        untrack(() => {
            if (current && !openGroups.includes(current.category)) openGroups = [...openGroups, current.category];
        });
    });

    const toggleGroup = (id) => {
        openGroups = openGroups.includes(id) ? openGroups.filter((g) => g !== id) : [...openGroups, id];
    };

    const isOpen = (id) => query.trim() !== "" || openGroups.includes(id);

    const pages = [
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" }
    ];

    const matches = (name) => name.toLowerCase().includes(query.trim().toLowerCase());

    const groups = $derived(
        [
            {
                id: "start",
                name: "Getting started",
                icon: null,
                links: pages.filter((p) => matches(p.name))
            },
            ...categories.map((category) => ({
                id: category.id,
                name: category.sidebarName,
                icon: category.icon,
                links: toolsIn(category.id)
                    .filter((tool) => matches(tool.sidebarName) || matches(tool.title))
                    .map((tool) => ({ name: tool.sidebarName, path: tool.path }))
            }))
        ].filter((group) => group.links.length > 0)
    );

    const isActive = (path) => page.url.pathname === `${base}${path}/`;

    // On small screens the sidebar is an offcanvas; close it after choosing a page.
    afterNavigate(() => {
        const sidebar = document.getElementById("sidebar");
        if (sidebar?.classList.contains("show")) sidebar.querySelector(".btn-close")?.click();
    });

    const onKeydown = (event) => {
        const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName);
        if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            searchInput?.focus();
        }
    };
</script>

<svelte:window onkeydown={onKeydown} />

<nav class="sidebar offcanvas-start offcanvas-lg" tabindex="-1" id="sidebar">
    <div class="offcanvas-header border-bottom border-secondary border-opacity-25">
        <a href="{base}/" class="sidebar-brand d-flex align-items-center me-auto">
            <img src="{base}/favicon.png" alt="Logo" width="28" height="28" class="d-block flex-shrink-0 me-1" />
            Mools
        </a>
        <span class="d-none d-lg-inline-block">
            <ThemeSwitcher />
        </span>
        <button
            type="button"
            class="btn-close d-lg-none"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            data-bs-target="#sidebar"
        ></button>
    </div>
    <div class="offcanvas-body">
        <div class="mt-2 mb-3">
            <input
                type="search"
                class="form-control"
                placeholder="Search tools ( / )"
                aria-label="Search tools"
                bind:this={searchInput}
                bind:value={query}
                onkeydown={(e) => e.key === "Escape" && ((query = ""), e.currentTarget.blur())}
            />
        </div>
        <ul class="sidebar-nav">
            {#each groups as group (group.id)}
                <hr class="sidebar-divider" />
                <li>
                    <button
                        type="button"
                        class="sidebar-group btn btn-link text-reset text-decoration-none d-flex align-items-center w-100 p-0 text-start"
                        aria-expanded={isOpen(group.id)}
                        aria-controls="group-{group.id}"
                        onclick={() => toggleGroup(group.id)}
                    >
                        {#if group.icon}<i class="bi bi-{group.icon} me-1"></i>{/if}
                        <span class="me-auto">{group.name}</span>
                        <span class="badge bg-body-secondary text-body-secondary fw-normal me-1">{group.links.length}</span>
                        <i class="bi bi-chevron-{isOpen(group.id) ? 'up' : 'down'} small"></i>
                    </button>
                </li>
                {#if isOpen(group.id)}
                    {#each group.links as link (link.path)}
                        <li class="nav-item" id={link === group.links[0] ? `group-${group.id}` : undefined}>
                            <a
                                class="nav-link"
                                class:active={isActive(link.path)}
                                href={resolve(`${link.path}/`)}
                                aria-current={isActive(link.path) ? "page" : undefined}
                            >
                                <i class="bi bi-dot"></i>
                                {link.name}
                            </a>
                        </li>
                    {/each}
                {/if}
            {:else}
                <li class="text-body-secondary small px-2">No tools match "{query}".</li>
            {/each}
        </ul>
    </div>
</nav>
