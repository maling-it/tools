<script>
    import StatRows from "../../../components/StatRows.svelte";
    import { UNITS, convertUnit } from "#lib/devUtils.js";

    let category = $state("length");
    let value = $state(1);
    let from = $state("m");

    const units = $derived(Object.keys(UNITS[category]));

    const changeCategory = () => {
        from = Object.keys(UNITS[category])[0];
    };

    const result = $derived.by(() => {
        try {
            return { rows: units.filter((u) => u !== from).map((to) => [to, Number(convertUnit(category, value, from, to).toPrecision(8))]), error: "" };
        } catch (e) {
            return { rows: [], error: e.message };
        }
    });
</script>

<svelte:head>
    <title>Unit Converter | Mools</title>
</svelte:head>

<h1>Unit Converter</h1>
<p class="text-body-secondary mb-3">Convert length, mass, volume, speed, area, data, time and temperature units.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="category" class="form-label">Type</label>
                <select id="category" class="form-select" bind:value={category} onchange={changeCategory}>
                    {#each Object.keys(UNITS) as name (name)}
                        <option value={name}>{name[0].toUpperCase() + name.slice(1)}</option>
                    {/each}
                </select>
            </div>
            <div class="row g-2">
                <div class="col-7">
                    <label for="value" class="form-label">Value</label>
                    <input id="value" class="form-control" type="number" step="any" bind:value />
                </div>
                <div class="col-5">
                    <label for="from" class="form-label">From</label>
                    <select id="from" class="form-select" bind:value={from}>
                        {#each units as unit (unit)}
                            <option>{unit}</option>
                        {/each}
                    </select>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {:else}
            <StatRows title="Converted" copyable rows={result.rows} />
        {/if}
    </div>
</div>
