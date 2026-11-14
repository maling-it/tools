<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { buildHtmlLink } from "#lib/generators.js";

    let url = $state("");
    let text = $state("");
    let title = $state("");
    let newTab = $state(false);
    let nofollow = $state(false);

    const html = $derived(url.trim() ? buildHtmlLink({ url: url.trim(), text: text.trim(), title: title.trim(), newTab, nofollow }) : "");
</script>

<svelte:head>
    <title>Create HTML Link | Mools</title>
</svelte:head>

<h1>Create HTML Link</h1>
<p class="text-body-secondary mb-3">Build an HTML anchor tag with the attributes you need.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="url" class="form-label">URL</label>
                <input id="url" class="form-control" type="url" placeholder="https://example.com" bind:value={url} />
            </div>
            <div class="mb-3">
                <label for="text" class="form-label">Link text</label>
                <input id="text" class="form-control" placeholder="Visit example" bind:value={text} />
            </div>
            <div class="mb-3">
                <label for="title" class="form-label">Title (optional)</label>
                <input id="title" class="form-control" bind:value={title} />
            </div>
            <div class="form-check">
                <input id="new-tab" class="form-check-input" type="checkbox" bind:checked={newTab} />
                <label class="form-check-label" for="new-tab">Open in a new tab</label>
            </div>
            <div class="form-check">
                <input id="nofollow" class="form-check-input" type="checkbox" bind:checked={nofollow} />
                <label class="form-check-label" for="nofollow">Add rel="nofollow"</label>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        <OutputCard title="HTML" text={html} />
    </div>
</div>
