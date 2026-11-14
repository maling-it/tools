<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { buildDesignMd } from "#lib/vibe.js";

    let form = $state({ name: "", description: "", headingFont: "", bodyFont: "", radius: "", spacing: "", tone: "", components: "", dos: "", donts: "" });
    let colors = $state([
        { id: 1, name: "Primary", hex: "#0d6efd" },
        { id: 2, name: "Background", hex: "#ffffff" },
        { id: 3, name: "Text", hex: "#212529" }
    ]);
    let nextId = 4;

    const md = $derived(buildDesignMd({ ...form, colors }));

    const textFields = [
        ["name", "Product name"],
        ["headingFont", "Heading font"],
        ["bodyFont", "Body font"],
        ["radius", "Corner radius"],
        ["spacing", "Spacing scale"]
    ];
</script>

<svelte:head>
    <title>DESIGN.md Generator | Mools</title>
</svelte:head>

<h1>DESIGN.md Generator</h1>
<p class="text-body-secondary mb-3">Describe your visual identity so coding agents build UI that matches it. Save the result as <code>DESIGN.md</code> next to your AGENTS.md.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="row g-2 mb-3">
                {#each textFields as [key, label] (key)}
                    <div class="col-6">
                        <label for={key} class="form-label small mb-0">{label}</label>
                        <input id={key} class="form-control" bind:value={form[key]} />
                    </div>
                {/each}
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea id="description" class="form-control" rows="2" bind:value={form.description}></textarea>
            </div>
            <fieldset class="mb-3">
                <legend class="form-label fs-6">Colors</legend>
                {#each colors as color (color.id)}
                    <div class="input-group mb-2">
                        <input class="form-control" aria-label="Color role" placeholder="Role" bind:value={color.name} />
                        <input class="form-control font-monospace" aria-label="Hex value" placeholder="#000000" bind:value={color.hex} />
                        <input class="form-control form-control-color flex-grow-0" type="color" aria-label="Pick color" value={/^#[0-9a-f]{6}$/i.test(color.hex) ? color.hex : "#000000"} oninput={(e) => (color.hex = e.currentTarget.value)} />
                        <button class="btn btn-outline-danger" type="button" aria-label="Remove color" onclick={() => (colors = colors.filter((c) => c.id !== color.id))}><i class="bi bi-x-lg"></i></button>
                    </div>
                {/each}
                <button class="btn btn-sm btn-outline-primary" type="button" onclick={() => colors.push({ id: nextId++, name: "", hex: "" })}><i class="bi bi-plus-lg me-1"></i>Add color</button>
            </fieldset>
            <div class="mb-3">
                <label for="tone" class="form-label">Tone and feel</label>
                <textarea id="tone" class="form-control" rows="2" placeholder="Calm, trustworthy, lots of whitespace" bind:value={form.tone}></textarea>
            </div>
            <div class="mb-3">
                <label for="components" class="form-label">Component notes</label>
                <textarea id="components" class="form-control" rows="3" placeholder="Buttons are pill shaped. Cards have a 1px border and no shadow." bind:value={form.components}></textarea>
            </div>
            <div class="row g-2">
                <div class="col-md-6">
                    <label for="dos" class="form-label">Do (one per line)</label>
                    <textarea id="dos" class="form-control" rows="3" bind:value={form.dos}></textarea>
                </div>
                <div class="col-md-6">
                    <label for="donts" class="form-label">Don't (one per line)</label>
                    <textarea id="donts" class="form-control" rows="3" bind:value={form.donts}></textarea>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        <OutputCard title="DESIGN.md" text={md} filename="DESIGN.md" mime="text/markdown" />
    </div>
</div>
