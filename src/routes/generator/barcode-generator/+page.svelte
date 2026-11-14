<script>
    let text = $state("123456789012");
    let format = $state("CODE128");
    let width = $state(2);
    let height = $state(100);
    let displayValue = $state(true);
    let error = $state("");
    let svgElement = $state();

    const formats = {
        CODE128: "Code 128 (any text)",
        CODE39: "Code 39",
        EAN13: "EAN-13 (12 or 13 digits)",
        EAN8: "EAN-8 (7 or 8 digits)",
        UPC: "UPC-A (11 or 12 digits)",
        ITF14: "ITF-14 (13 or 14 digits)",
        MSI: "MSI (digits)",
        pharmacode: "Pharmacode (3 to 131070)"
    };

    $effect(() => {
        const options = { format, width, height, displayValue, margin: 10 };
        const content = text;
        const target = svgElement;
        if (!target) return;
        if (!content) {
            target.innerHTML = "";
            error = "";
            return;
        }
        let cancelled = false;
        import("jsbarcode").then(({ default: JsBarcode }) => {
            if (cancelled) return;
            try {
                JsBarcode(target, content, { ...options, valid: (ok) => { error = ok ? "" : "This value is not valid for the selected format."; } });
            } catch {
                target.innerHTML = "";
                error = "This value is not valid for the selected format.";
            }
        });
        return () => (cancelled = true);
    });

    const serialize = () => new XMLSerializer().serializeToString(svgElement);

    const save = (url, name) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.click();
    };

    const downloadSvg = () => {
        const url = URL.createObjectURL(new Blob([serialize()], { type: "image/svg+xml" }));
        save(url, "barcode.svg");
        URL.revokeObjectURL(url);
    };

    const downloadPng = () => {
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext("2d");
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0);
            save(canvas.toDataURL("image/png"), "barcode.png");
        };
        image.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialize());
    };
</script>

<svelte:head>
    <title>Barcode Generator | Mools</title>
</svelte:head>

<h1>Barcode Generator</h1>
<p class="text-body-secondary mb-3">Create barcodes in popular formats and download them as PNG or SVG.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="text" class="form-label">Value</label>
                <input id="text" class="form-control font-monospace" bind:value={text} />
            </div>
            <div class="mb-3">
                <label for="format" class="form-label">Format</label>
                <select id="format" class="form-select" bind:value={format}>
                    {#each Object.entries(formats) as [value, label] (value)}
                        <option {value}>{label}</option>
                    {/each}
                </select>
            </div>
            <div class="mb-3">
                <label for="width" class="form-label">Bar width: {width}</label>
                <input id="width" class="form-range" type="range" min="1" max="5" bind:value={width} />
            </div>
            <div class="mb-3">
                <label for="height" class="form-label">Height: {height}px</label>
                <input id="height" class="form-range" type="range" min="40" max="300" step="10" bind:value={height} />
            </div>
            <div class="form-check">
                <input id="display" class="form-check-input" type="checkbox" bind:checked={displayValue} />
                <label class="form-check-label" for="display">Show text below the bars</label>
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        <div class="card p-3 text-center">
            {#if error}
                <div class="alert alert-danger py-2" role="alert">{error}</div>
            {/if}
            <div class="bg-white rounded p-2 mb-3 overflow-auto" class:d-none={!!error || !text}>
                <svg bind:this={svgElement}></svg>
            </div>
            {#if !error && text}
                <div class="d-flex gap-2 justify-content-center">
                    <button class="btn btn-primary" type="button" onclick={downloadPng}><i class="bi bi-download me-1"></i>PNG</button>
                    <button class="btn btn-outline-primary" type="button" onclick={downloadSvg}><i class="bi bi-download me-1"></i>SVG</button>
                </div>
            {/if}
        </div>
    </div>
</div>
