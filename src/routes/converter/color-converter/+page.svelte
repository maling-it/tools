<script>
    import StatRows from "../../../components/StatRows.svelte";
    import { describeColor, contrastRatio, parseColor } from "#lib/devUtils.js";

    let input = $state("#1e90ff");

    const result = $derived.by(() => {
        try {
            const info = describeColor(input);
            const rgb = parseColor(input);
            const pickerValue = "#" + [rgb.r, rgb.g, rgb.b].map((v) => v.toString(16).padStart(2, "0")).join("");
            return { info, pickerValue, onWhite: contrastRatio(input, "#ffffff"), onBlack: contrastRatio(input, "#000000"), error: "" };
        } catch (e) {
            return { error: e.message };
        }
    });

    const grade = (ratio) => (ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "AA large text only" : "Fail");
</script>

<svelte:head>
    <title>Color Converter | Mools</title>
</svelte:head>

<h1>Color Converter</h1>
<p class="text-body-secondary mb-3">Convert between HEX, RGB, HSL and CMYK, and check contrast against white and black.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <label for="color" class="form-label">Color (HEX, rgb() or hsl())</label>
            <div class="input-group mb-3">
                <input id="color" class="form-control font-monospace" bind:value={input} spellcheck="false" />
                {#if !result.error}
                    <input class="form-control form-control-color flex-grow-0" type="color" aria-label="Pick a color" value={result.pickerValue} oninput={(e) => (input = e.currentTarget.value)} />
                {/if}
            </div>
            {#if result.error}
                <div class="alert alert-danger py-2 mb-0" role="alert">{result.error}</div>
            {:else}
                <div class="rounded border mb-2" style="height: 5rem; background: {result.info.rgb};"></div>
            {/if}
        </div>
    </div>
    <div class="col-lg-7">
        {#if !result.error}
            <div class="d-flex flex-column gap-3">
                <StatRows title="Formats" copyable rows={[["HEX", result.info.hex], ["RGB", result.info.rgb], ["HSL", result.info.hsl], ["CMYK", result.info.cmyk]]} />
                <StatRows title="Contrast (WCAG)" rows={[["On white", `${result.onWhite}:1 · ${grade(result.onWhite)}`], ["On black", `${result.onBlack}:1 · ${grade(result.onBlack)}`]]} />
            </div>
        {/if}
    </div>
</div>
