<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { readAsDataUrl, formatBytes } from "#lib/image.js";

    let file = $state(null);
    let dataUrl = $state("");
    let error = $state("");

    const onFile = async (event) => {
        error = "";
        file = event.currentTarget.files[0] ?? null;
        dataUrl = "";
        if (!file) return;
        try {
            dataUrl = await readAsDataUrl(file);
        } catch (e) {
            error = e.message;
        }
    };

    const base64 = $derived(dataUrl.split(",")[1] ?? "");
</script>

<svelte:head>
    <title>Image to Base64 | Mools</title>
</svelte:head>

<h1>Image to Base64</h1>
<p class="text-body-secondary mb-3">Encode an image as a Base64 data URI. Files never leave your browser.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <label for="file" class="form-label">Image</label>
            <input id="file" class="form-control mb-3" type="file" accept="image/*" onchange={onFile} />
            {#if error}
                <div class="alert alert-danger py-2" role="alert">{error}</div>
            {/if}
            {#if dataUrl}
                <img src={dataUrl} alt="Preview" class="img-fluid rounded border mb-2" style="max-height: 16rem; object-fit: contain;" />
                <p class="small text-body-secondary mb-0">{file.name} · {formatBytes(file.size)} · {formatBytes(base64.length)} as Base64</p>
            {/if}
        </div>
    </div>
    <div class="col-lg-7 d-flex flex-column gap-3">
        <OutputCard title="Data URI" text={dataUrl} />
        <OutputCard title="Base64 only" text={base64} />
        <OutputCard title="HTML img tag" text={dataUrl ? `<img src="${dataUrl}" alt="">` : ""} />
        <OutputCard title="CSS background" text={dataUrl ? `background-image: url("${dataUrl}");` : ""} />
    </div>
</div>
