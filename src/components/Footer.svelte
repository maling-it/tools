<script>
    import { resolve } from "$app/paths";
    import { categories, tools } from "#lib/tools.js";
    import { REPO_URL } from "#lib/site.js";
    import { base } from "#lib/paths.js";

    const year = new Date().getFullYear();
</script>

<footer class="border-top mt-5 pt-4 pb-5 small">
    <div class="row g-4">
        <div class="col-lg-4">
            <div class="d-flex align-items-center mb-2">
                <img src="{base}/favicon.png" alt="" width="24" height="24" class="me-2" />
                <strong>Mools</strong>
            </div>
            <p class="text-body-secondary mb-0">{tools.length} free developer tools that run in your browser. Open source, no sign-up, no tracking of your input.</p>
        </div>
        <div class="col-6 col-lg-3">
            <h2 class="h6">Tools</h2>
            <ul class="list-unstyled mb-0">
                {#each categories as category (category.id)}
                    <li><a class="link-secondary text-decoration-none" href={resolve(`/${category.id}/`)}>{category.name}</a></li>
                {/each}
            </ul>
        </div>
        <div class="col-6 col-lg-2">
            <h2 class="h6">For agents</h2>
            <ul class="list-unstyled mb-0">
                <li><a class="link-secondary text-decoration-none" href="{base}/llms.txt">llms.txt</a></li>
                <li><a class="link-secondary text-decoration-none" href="{base}/tools.json">tools.json</a></li>
                <li><a class="link-secondary text-decoration-none" href="{base}/sitemap.xml">Sitemap</a></li>
                <li><a class="link-secondary text-decoration-none" href="{REPO_URL}#agent-support">MCP server</a></li>
            </ul>
        </div>
        <div class="col-6 col-lg-3">
            <h2 class="h6">Project</h2>
            <ul class="list-unstyled mb-0">
                <li><a class="link-secondary text-decoration-none" href={resolve("/about/")}>About</a></li>
                <li><a class="link-secondary text-decoration-none" href={resolve("/contact/")}>Contact</a></li>
                <li><a class="link-secondary text-decoration-none" href={REPO_URL} rel="noreferrer">GitHub</a></li>
                <li><a class="link-secondary text-decoration-none" href="#top" onclick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Back to top <i class="bi bi-arrow-up"></i></a></li>
            </ul>
        </div>
    </div>
    <p class="text-body-secondary mt-4 mb-0">&copy; {year} maling-it. Released under the <a class="link-secondary" href="{REPO_URL}/blob/master/LICENSE" rel="noreferrer">MIT license</a>. Built with SvelteKit and Halfmoon.</p>
</footer>
