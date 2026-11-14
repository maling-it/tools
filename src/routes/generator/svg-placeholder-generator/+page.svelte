<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { svgPlaceholder } from "#lib/devUtils.js";

    let width = $state(600);
    let height = $state(400);
    let background = $state("#cccccc");
    let color = $state("#666666");
    let text = $state("");

    const svg = $derived(svgPlaceholder({ width: Number(width) || 1, height: Number(height) || 1, background, color, text }));
    const dataUri = $derived(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
</script>

<svelte:head>
    <title>SVG Placeholder Generator | Mools</title>
</svelte:head>

<h1>SVG Placeholder Generator</h1>
<p class="text-body-secondary mb-3">Create a placeholder image as SVG, ready to paste or use as a data URI.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="row g-2 mb-3">
                <div class="col-6">
                    <label for="width" class="form-label">Width</label>
                    <input id="width" class="form-control" type="number" min="1" max="4000" bind:value={width} />
                </div>
                <div class="col-6">
                    <label for="height" class="form-label">Height</label>
                    <input id="height" class="form-control" type="number" min="1" max="4000" bind:value={height} />
                </div>
            </div>
            <div class="mb-3">
                <label for="text" class="form-label">Text (defaults to the size)</label>
                <input id="text" class="form-control" bind:value={text} />
            </div>
            <div class="d-flex gap-3">
                <div>
                    <label for="bg" class="form-label">Background</label>
                    <input id="bg" class="form-control form-control-color" type="color" bind:value={background} />
                </div>
                <div>
                    <label for="fg" class="form-label">Text color</label>
                    <input id="fg" class="form-control form-control-color" type="color" bind:value={color} />
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-7 d-flex flex-column gap-3">
        <div class="card p-3 text-center">
            <img src={dataUri} alt="Placeholder preview" class="mx-auto" style="max-width: 100%; height: auto;" />
        </div>
        <OutputCard title="SVG" text={svg} filename="placeholder.svg" mime="image/svg+xml" />
        <OutputCard title="Data URI" text={dataUri} />
    </div>
</div>
