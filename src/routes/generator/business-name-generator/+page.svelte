<script>
    import ResultList from "../../../components/ResultList.svelte";
    import { businessNames } from "#lib/generators.js";

    let keyword = $state("");
    let names = $state([]);
    const generate = () => (names = businessNames(keyword, 12));
</script>

<svelte:head>
    <title>Shopify Business Name Generator | Mools</title>
</svelte:head>

<h1>Shopify Business Name Generator</h1>
<p class="text-body-secondary mb-3">Get store name ideas from a keyword. Check that a name and its domain are available before you commit.</p>

<form class="card p-3 mb-3" onsubmit={(e) => { e.preventDefault(); generate(); }}>
    <label for="keyword" class="form-label">Keyword (optional)</label>
    <div class="input-group">
        <input id="keyword" class="form-control" placeholder="e.g. candles" bind:value={keyword} />
        <button class="btn btn-primary" type="submit">Generate</button>
    </div>
</form>

{#if names.length > 0}
    <ResultList items={names} title="Business names" />
{/if}
