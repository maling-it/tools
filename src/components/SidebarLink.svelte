<script>
    import { page } from '$app/stores';
    export let links = [];

    function isActive(link) {
        return link.active ? "active" : "";
    }

</script>

<ul class="sidebar-nav">
    {#each links as link, index (index)}
        {#if link.divider}
        <hr class="sidebar-divider" />
            <li key={index}>
                <i class="ml-auto bi bi-{link.icon}"></i>
                {link.name}
            </li>
        {:else}
            <li class="nav-item" key={index}>
                <a
                    class="nav-link {isActive(link)} {link.url === $page.url.pathname ? 'active' : ''}"
                    href={link.url}
                    aria-current={link.active ? "page" : null}
                >
                <i class="bi bi-dot"></i>
                    {link.name}
                </a>
            </li>
        {/if}
    {/each}
</ul>
