<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { buildMetaTags } from "#lib/generators.js";

    let form = $state({
        title: "",
        description: "",
        keywords: "",
        author: "",
        url: "",
        image: "",
        siteName: "",
        robots: "index, follow",
        twitterCard: "summary_large_image"
    });

    const fields = [
        ["title", "Page title", "text"],
        ["description", "Description", "textarea"],
        ["keywords", "Keywords (comma separated)", "text"],
        ["author", "Author", "text"],
        ["url", "Canonical URL", "url"],
        ["image", "Image URL (for sharing)", "url"],
        ["siteName", "Site name", "text"]
    ];

    const tags = $derived(buildMetaTags(form));
</script>

<svelte:head>
    <title>Meta Tags Generator | Mools</title>
</svelte:head>

<h1>Meta Tags Generator</h1>
<p class="text-body-secondary mb-3">Generate meta tags for search engines, Open Graph and Twitter cards.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            {#each fields as [key, label, type] (key)}
                <div class="mb-3">
                    <label for={key} class="form-label">
                        {label}
                        {#if key === "title"}<small class="text-body-secondary">({form.title.length}/60)</small>{/if}
                        {#if key === "description"}<small class="text-body-secondary">({form.description.length}/160)</small>{/if}
                    </label>
                    {#if type === "textarea"}
                        <textarea id={key} class="form-control" rows="3" bind:value={form[key]}></textarea>
                    {:else}
                        <input id={key} class="form-control" {type} bind:value={form[key]} />
                    {/if}
                </div>
            {/each}
            <div class="d-flex gap-3 flex-wrap">
                <div>
                    <label for="robots" class="form-label">Robots</label>
                    <select id="robots" class="form-select" bind:value={form.robots}>
                        <option value="index, follow">index, follow</option>
                        <option value="noindex, follow">noindex, follow</option>
                        <option value="index, nofollow">index, nofollow</option>
                        <option value="noindex, nofollow">noindex, nofollow</option>
                    </select>
                </div>
                <div>
                    <label for="card" class="form-label">Twitter card</label>
                    <select id="card" class="form-select" bind:value={form.twitterCard}>
                        <option value="summary_large_image">summary_large_image</option>
                        <option value="summary">summary</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        <OutputCard title="HTML" text={tags} filename="meta-tags.html" mime="text/html" />
    </div>
</div>
