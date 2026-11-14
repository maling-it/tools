<script>
    import ResultList from "../../../components/ResultList.svelte";
    import { makeTitles } from "#lib/generators.js";

    let topic = $state("");
    const titles = $derived(makeTitles(topic));
</script>

<svelte:head>
    <title>Title Maker | Mools</title>
</svelte:head>

<h1>Title Maker</h1>
<p class="text-body-secondary mb-3">Enter a topic or keyword to get page title ideas. Aim for titles under 60 characters.</p>

<div class="card p-3 mb-3">
    <label for="topic" class="form-label">Topic or keyword</label>
    <input id="topic" class="form-control" placeholder="e.g. Home Gardening" bind:value={topic} />
</div>

{#if titles.length > 0}
    <ResultList items={titles} title="Title ideas" />
    <p class="small text-body-secondary mt-2">Long titles (over 60 characters) may be cut off in search results.</p>
{/if}
