<script>
    import { resolve } from "$app/paths";
    import { page } from "$app/state";
    import ThemeSwitcher from "./ThemeSwitcher.svelte";
    import { categories, toolsIn } from "#lib/tools.js";
    import { base } from "#lib/paths.js";

    let query = $state("");
    let searchInput = $state();

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

    const isActive = (path) => page.url.pathname === resolve(`${path}/`);

    const onKeydown = (event) => {
        const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName);
        if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
            event.preventDefault();
            searchInput?.focus();
        }
    };
</script>

<svelte:window onkeydown={onKeydown} />

<nav class="sidebar offcanvas-start offcanvas-md" tabindex="-1" id="sidebar">
    <div class="offcanvas-header border-bottom border-secondary border-opacity-25">
        <a href="{base}/" class="sidebar-brand d-flex align-items-center me-auto">
            <img src="{base}/favicon.png" alt="Logo" width="28" height="28" class="d-block flex-shrink-0 me-1" />
            Mools
        </a>
        <span class="d-none d-md-inline-block">
            <ThemeSwitcher />
        </span>
        <button
            type="button"
            class="btn-close d-md-none"
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
                    {#if group.icon}<i class="ml-auto bi bi-{group.icon}"></i>{/if}
                    {group.name}
                </li>
                {#each group.links as link (link.path)}
                    <li class="nav-item">
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
            {:else}
                <li class="text-body-secondary small px-2">No tools match "{query}".</li>
            {/each}
        </ul>
    </div>
</nav>
