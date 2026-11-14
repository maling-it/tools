<script>
    import StatRows from "../../../components/StatRows.svelte";
    import { capRate } from "#lib/calculators.js";

    let price = $state(500000);
    let income = $state(60000);
    let expenses = $state(20000);

    const result = $derived.by(() => {
        try {
            return { data: capRate({ price, income, expenses }), error: "" };
        } catch (e) {
            return { data: null, error: e.message };
        }
    });

    const money = (n) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
</script>

<svelte:head>
    <title>Cap Rate Calculator | Mools</title>
</svelte:head>

<h1>Cap Rate Calculator</h1>
<p class="text-body-secondary mb-3">Capitalization rate = net operating income ÷ property price.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="price" class="form-label">Property price / value</label>
                <input id="price" class="form-control" type="number" min="0" step="any" bind:value={price} />
            </div>
            <div class="mb-3">
                <label for="income" class="form-label">Annual gross income</label>
                <input id="income" class="form-control" type="number" min="0" step="any" bind:value={income} />
            </div>
            <div>
                <label for="expenses" class="form-label">Annual operating expenses</label>
                <input id="expenses" class="form-control" type="number" min="0" step="any" bind:value={expenses} />
                <div class="form-text">Taxes, insurance, maintenance, management. Exclude mortgage payments.</div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {:else}
            <StatRows rows={[["Net operating income", money(result.data.noi)], ["Cap rate", `${result.data.capRate.toFixed(2)}%`]]} />
        {/if}
    </div>
</div>
