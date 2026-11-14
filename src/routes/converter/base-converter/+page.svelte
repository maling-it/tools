<script>
    import StatRows from "../../../components/StatRows.svelte";
    import { convertBase } from "#lib/devUtils.js";

    let value = $state("255");
    let from = $state(10);
    let custom = $state(36);

    const result = $derived.by(() => {
        try {
            const b = Number(from);
            return { rows: [["Binary (2)", convertBase(value, b, 2)], ["Octal (8)", convertBase(value, b, 8)], ["Decimal (10)", convertBase(value, b, 10)], ["Hexadecimal (16)", convertBase(value, b, 16)], [`Base ${custom}`, convertBase(value, b, Number(custom))]], error: "" };
        } catch (e) {
            return { rows: [], error: e.message };
        }
    });
</script>

<svelte:head>
    <title>Integer Base Converter | Mools</title>
</svelte:head>

<h1>Integer Base Converter</h1>
<p class="text-body-secondary mb-3">Convert whole numbers between binary, octal, decimal, hexadecimal and any base up to 36. Large numbers are supported.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="value" class="form-label">Number</label>
                <input id="value" class="form-control font-monospace" bind:value spellcheck="false" />
            </div>
            <div class="mb-3">
                <label for="from" class="form-label">Input base</label>
                <input id="from" class="form-control w-auto" type="number" min="2" max="36" bind:value={from} />
            </div>
            <div>
                <label for="custom" class="form-label">Extra output base</label>
                <input id="custom" class="form-control w-auto" type="number" min="2" max="36" bind:value={custom} />
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {:else}
            <StatRows title="Results" copyable rows={result.rows} />
        {/if}
    </div>
</div>
