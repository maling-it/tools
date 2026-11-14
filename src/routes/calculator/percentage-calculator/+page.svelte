<script>
    import { percentages } from "#lib/devUtils.js";

    let a = $state(20);
    let b = $state(50);

    const result = $derived.by(() => {
        try {
            return { data: percentages({ x: a, y: b }), error: "" };
        } catch (e) {
            return { data: null, error: e.message };
        }
    });

    const fmt = (n) => (n === null ? "undefined" : Number(n.toFixed(4)).toLocaleString());
</script>

<svelte:head>
    <title>Percentage Calculator | Mools</title>
</svelte:head>

<h1>Percentage Calculator</h1>
<p class="text-body-secondary mb-3">Enter two numbers to get the three most common percentage answers.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="a" class="form-label">First number (X)</label>
                <input id="a" class="form-control" type="number" step="any" bind:value={a} />
            </div>
            <div>
                <label for="b" class="form-label">Second number (Y)</label>
                <input id="b" class="form-control" type="number" step="any" bind:value={b} />
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {:else}
            <div class="card p-3">
                <table class="table mb-0">
                    <tbody>
                        <tr><td>{a}% of {b}</td><th class="text-end">{fmt(result.data.percentOf)}</th></tr>
                        <tr><td>{a} is what % of {b}</td><th class="text-end">{fmt(result.data.isWhatPercent)}%</th></tr>
                        <tr><td>Change from {a} to {b}</td><th class="text-end">{fmt(result.data.change)}%</th></tr>
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
</div>
