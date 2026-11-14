<script>
    import OutputCard from "../../../components/OutputCard.svelte";

    let b = $state({
        text: "Click me",
        background: "#0d6efd",
        hover: "#0b5ed7",
        color: "#ffffff",
        radius: 8,
        paddingY: 10,
        paddingX: 20,
        fontSize: 16,
        borderWidth: 0,
        borderColor: "#0a58ca",
        shadow: true
    });

    const css = $derived(
        `.button {\n  display: inline-block;\n  background: ${b.background};\n  color: ${b.color};\n  padding: ${b.paddingY}px ${b.paddingX}px;\n  font-size: ${b.fontSize}px;\n  border: ${b.borderWidth}px solid ${b.borderColor};\n  border-radius: ${b.radius}px;\n${b.shadow ? "  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);\n" : ""}  cursor: pointer;\n  text-decoration: none;\n  transition: background 0.2s ease;\n}\n\n.button:hover {\n  background: ${b.hover};\n}`
    );
    const html = $derived(`<a class="button" href="#">${b.text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</a>`);

    const controls = [
        ["radius", "Border radius", 0, 50],
        ["paddingY", "Vertical padding", 0, 40],
        ["paddingX", "Horizontal padding", 0, 80],
        ["fontSize", "Font size", 10, 40],
        ["borderWidth", "Border width", 0, 10]
    ];
    const colors = [
        ["background", "Background"],
        ["hover", "Hover background"],
        ["color", "Text color"],
        ["borderColor", "Border color"]
    ];
</script>

<svelte:head>
    <title>CSS Button Generator | Mools</title>
</svelte:head>

<h1>CSS Button Generator</h1>
<p class="text-body-secondary mb-3">Design a button and copy the CSS and HTML.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="text" class="form-label">Text</label>
                <input id="text" class="form-control" bind:value={b.text} />
            </div>
            {#each controls as [key, label, min, max] (key)}
                <div class="mb-2">
                    <label for={key} class="form-label mb-0">{label}: {b[key]}px</label>
                    <input id={key} class="form-range" type="range" {min} {max} bind:value={b[key]} />
                </div>
            {/each}
            <div class="row g-2 mt-1">
                {#each colors as [key, label] (key)}
                    <div class="col-6">
                        <label for={key} class="form-label mb-0 small">{label}</label>
                        <input id={key} class="form-control form-control-color w-100" type="color" bind:value={b[key]} />
                    </div>
                {/each}
            </div>
            <div class="form-check mt-3">
                <input id="shadow" class="form-check-input" type="checkbox" bind:checked={b.shadow} />
                <label class="form-check-label" for="shadow">Drop shadow</label>
            </div>
        </div>
    </div>
    <div class="col-lg-7 d-flex flex-column gap-3">
        <div class="card p-4 text-center">
            <div>
                <span
                    class="preview"
                    style="--bg: {b.background}; --hover: {b.hover}; color: {b.color}; padding: {b.paddingY}px {b.paddingX}px; font-size: {b.fontSize}px; border: {b.borderWidth}px solid {b.borderColor}; border-radius: {b.radius}px; box-shadow: {b.shadow ? '0 2px 6px rgba(0, 0, 0, 0.25)' : 'none'};"
                >{b.text}</span>
            </div>
        </div>
        <OutputCard title="CSS" text={css} filename="button.css" mime="text/css" />
        <OutputCard title="HTML" text={html} />
    </div>
</div>

<style>
    .preview {
        display: inline-block;
        background: var(--bg);
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .preview:hover {
        background: var(--hover);
    }
</style>
