<script>
    import StatRows from "../../../components/StatRows.svelte";
    import { averageCost } from "#lib/calculators.js";

    let rows = $state([
        { id: 1, amount: 1, price: 30000 },
        { id: 2, amount: 0.5, price: 20000 }
    ]);
    let nextId = 3;

    const result = $derived(averageCost(rows.map((row) => ({ amount: Number(row.amount), price: Number(row.price) }))));
    const fmt = (n, digits = 2) => n.toLocaleString(undefined, { maximumFractionDigits: digits });
</script>

<svelte:head>
    <title>Crypto Average Calculator | Mools</title>
</svelte:head>

<h1>Crypto Average Calculator</h1>
<p class="text-body-secondary mb-3">Enter each purchase to find your average buy price (dollar-cost average).</p>

<div class="row g-3">
    <div class="col-lg-7">
        <div class="card p-3">
            {#each rows as row, index (row.id)}
                <div class="row g-2 mb-2 align-items-end">
                    <div class="col">
                        <label for="amount-{row.id}" class="form-label small mb-0">Amount {index + 1}</label>
                        <input id="amount-{row.id}" class="form-control" type="number" min="0" step="any" bind:value={row.amount} />
                    </div>
                    <div class="col">
                        <label for="price-{row.id}" class="form-label small mb-0">Price per coin</label>
                        <input id="price-{row.id}" class="form-control" type="number" min="0" step="any" bind:value={row.price} />
                    </div>
                    <div class="col-auto">
                        <button class="btn btn-outline-danger" type="button" aria-label="Remove purchase" disabled={rows.length === 1} onclick={() => (rows = rows.filter((r) => r.id !== row.id))}>
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            {/each}
            <div>
                <button class="btn btn-outline-primary" type="button" onclick={() => rows.push({ id: nextId++, amount: 0, price: 0 })}>
                    <i class="bi bi-plus-lg me-1"></i>Add purchase
                </button>
            </div>
        </div>
    </div>
    <div class="col-lg-5">
        <StatRows
            rows={[
                ["Total amount", fmt(result.totalAmount, 8)],
                ["Total cost", fmt(result.totalCost)],
                ["Average price", fmt(result.average, 8)]
            ]}
        />
    </div>
</div>
