<script>
    import OutputCard from "./OutputCard.svelte";
    import { buildAffiliateLink } from "#lib/generators.js";

    let { store } = $props();

    const names = { amazon: "Amazon", audible: "Audible" };
    const domains = {
        amazon: ["www.amazon.com", "www.amazon.co.uk", "www.amazon.de", "www.amazon.fr", "www.amazon.ca", "www.amazon.co.jp", "www.amazon.in"],
        audible: ["www.audible.com", "www.audible.co.uk", "www.audible.de", "www.audible.fr", "www.audible.ca"]
    };

    let asin = $state("");
    let tag = $state("");
    // svelte-ignore state_referenced_locally
    let domain = $state(domains[store][0]);

    const result = $derived.by(() => {
        if (!asin.trim()) return { link: "", error: "" };
        try {
            return { link: buildAffiliateLink({ store, id: asin, tag, domain }), error: "" };
        } catch (e) {
            return { link: "", error: e.message };
        }
    });
</script>

<svelte:head>
    <title>{names[store]} Link Maker | Mools</title>
</svelte:head>

<h1>{names[store]} Link Maker</h1>
<p class="text-body-secondary mb-3">Build a clean {names[store]} product link that carries your affiliate tag.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="asin" class="form-label">ASIN</label>
                <input id="asin" class="form-control font-monospace" maxlength="10" placeholder="B08N5WRWNW" bind:value={asin} />
                <div class="form-text">The 10 character product ID found in the product page URL or details.</div>
            </div>
            <div class="mb-3">
                <label for="tag" class="form-label">Affiliate tag</label>
                <input id="tag" class="form-control" placeholder="yourtag-20" bind:value={tag} />
            </div>
            <div class="mb-3">
                <label for="domain" class="form-label">Store</label>
                <select id="domain" class="form-select" bind:value={domain}>
                    {#each domains[store] as option (option)}
                        <option>{option}</option>
                    {/each}
                </select>
            </div>
            {#if result.error}
                <div class="alert alert-danger py-2 mb-0" role="alert">{result.error}</div>
            {/if}
        </div>
    </div>
    <div class="col-lg-6">
        <OutputCard title="Link" text={result.link} />
    </div>
</div>
