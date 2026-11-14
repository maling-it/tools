<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { buildLlmsTxt } from "#lib/vibe.js";

    let form = $state({
        title: "",
        summary: "",
        details: "",
        sections: "## Docs\nGetting started | https://example.com/docs/start | How to install and run\nAPI reference | https://example.com/docs/api\n\n## Optional\nChangelog | https://example.com/changelog"
    });

    const result = $derived.by(() => {
        try {
            return { text: buildLlmsTxt(form), error: "" };
        } catch (e) {
            return { text: "", error: form.title ? e.message : "" };
        }
    });
</script>

<svelte:head>
    <title>llms.txt Generator | Mools</title>
</svelte:head>

<h1>llms.txt Generator</h1>
<p class="text-body-secondary mb-3">Help AI assistants understand your site. Create an <code>/llms.txt</code> file with a short summary and links to your most useful pages.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="title" class="form-label">Site or project name</label>
                <input id="title" class="form-control" bind:value={form.title} />
            </div>
            <div class="mb-3">
                <label for="summary" class="form-label">One-line summary</label>
                <input id="summary" class="form-control" bind:value={form.summary} />
            </div>
            <div class="mb-3">
                <label for="details" class="form-label">More details (optional)</label>
                <textarea id="details" class="form-control" rows="3" bind:value={form.details}></textarea>
            </div>
            <div>
                <label for="sections" class="form-label">Links</label>
                <textarea id="sections" class="form-control font-monospace" rows="9" spellcheck="false" bind:value={form.sections}></textarea>
                <div class="form-text">Start a group with <code>## Name</code>, then one link per line: <code>Title | URL | optional note</code>.</div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {/if}
        <OutputCard title="llms.txt" text={result.text} filename="llms.txt" />
    </div>
</div>
