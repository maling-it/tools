<script>
    import StatRows from "./StatRows.svelte";
    import { concrete, dirt } from "#lib/calculators.js";

    let { kind, title, description } = $props();

    let length = $state(10);
    let width = $state(10);
    // svelte-ignore state_referenced_locally
    let depth = $state(kind === "concrete" ? 4 : 3);
    let lengthUnit = $state("ft");
    let depthUnit = $state("in");
    // svelte-ignore state_referenced_locally
    let wastePercent = $state(kind === "concrete" ? 10 : 0);

    const result = $derived.by(() => {
        try {
            const input = { length, width, depth, lengthUnit, depthUnit, wastePercent };
            return { data: kind === "concrete" ? concrete(input) : dirt(input), error: "" };
        } catch (e) {
            return { data: null, error: e.message };
        }
    });

    const fmt = (n, digits = 2) => n.toLocaleString(undefined, { maximumFractionDigits: digits });

    const rows = $derived(
        result.data
            ? [
                  ["Cubic yards", fmt(result.data.cubicYards)],
                  ["Cubic meters", fmt(result.data.cubicMeters)],
                  ["Cubic feet", fmt(result.data.cubicFeet)],
                  ...(kind === "concrete"
                      ? [["60 lb bags", fmt(result.data.bags60, 0)], ["80 lb bags", fmt(result.data.bags80, 0)]]
                      : [["Approx. tons", fmt(result.data.tons)]])
              ]
            : []
    );
</script>

<svelte:head>
    <title>{title} | Mools</title>
</svelte:head>

<h1>{title}</h1>
<p class="text-body-secondary mb-3">{description}</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="row g-3">
                <div class="col-6">
                    <label for="length" class="form-label">Length</label>
                    <input id="length" class="form-control" type="number" min="0" step="any" bind:value={length} />
                </div>
                <div class="col-6">
                    <label for="width" class="form-label">Width</label>
                    <input id="width" class="form-control" type="number" min="0" step="any" bind:value={width} />
                </div>
                <div class="col-12">
                    <label for="length-unit" class="form-label">Length and width unit</label>
                    <select id="length-unit" class="form-select" bind:value={lengthUnit}>
                        <option value="ft">Feet</option>
                        <option value="yd">Yards</option>
                        <option value="m">Meters</option>
                        <option value="in">Inches</option>
                        <option value="cm">Centimeters</option>
                    </select>
                </div>
                <div class="col-6">
                    <label for="depth" class="form-label">{kind === "concrete" ? "Thickness" : "Depth"}</label>
                    <input id="depth" class="form-control" type="number" min="0" step="any" bind:value={depth} />
                </div>
                <div class="col-6">
                    <label for="depth-unit" class="form-label">Unit</label>
                    <select id="depth-unit" class="form-select" bind:value={depthUnit}>
                        <option value="in">Inches</option>
                        <option value="ft">Feet</option>
                        <option value="cm">Centimeters</option>
                        <option value="m">Meters</option>
                    </select>
                </div>
                <div class="col-12">
                    <label for="waste" class="form-label">Extra for waste: {wastePercent}%</label>
                    <input id="waste" class="form-range" type="range" min="0" max="30" bind:value={wastePercent} />
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {:else}
            <StatRows {rows} />
            <p class="small text-body-secondary mt-2">
                {#if kind === "concrete"}
                    Bag counts assume 0.45 ft³ per 60 lb bag and 0.6 ft³ per 80 lb bag. Always confirm with your supplier.
                {:else}
                    Weight is an estimate at 1.25 tons per cubic yard; real soil varies with moisture and type.
                {/if}
            </p>
        {/if}
    </div>
</div>
