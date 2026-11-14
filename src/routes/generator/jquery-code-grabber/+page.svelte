<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { JQUERY_VERSIONS, jquerySnippets } from "#lib/generators.js";

    let version = $state(JQUERY_VERSIONS[0]);
    const snippets = $derived(jquerySnippets(version));
</script>

<svelte:head>
    <title>jQuery Code Grabber | Mools</title>
</svelte:head>

<h1>jQuery Code Grabber</h1>
<p class="text-body-secondary mb-3">Copy jQuery CDN script tags and quick-start snippets.</p>

<div class="card p-3 mb-3">
    <label for="version" class="form-label">jQuery version</label>
    <select id="version" class="form-select w-auto" bind:value={version}>
        {#each JQUERY_VERSIONS as option (option)}
            <option>{option}</option>
        {/each}
    </select>
</div>

<div class="row g-3">
    {#each snippets as snippet (snippet.title)}
        <div class="col-lg-6">
            <OutputCard title={snippet.title} text={snippet.code} />
        </div>
    {/each}
</div>
