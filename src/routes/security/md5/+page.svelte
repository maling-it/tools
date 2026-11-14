<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { md5, shaHash } from "#lib/generators.js";
    import SparkMD5 from "spark-md5";

    let text = $state("");
    let fileName = $state("");
    let hashes = $state({ md5: "", sha1: "", sha256: "", sha512: "" });
    let error = $state("");

    const hashBytes = async (buffer) => {
        const digest = async (algorithm) =>
            [...new Uint8Array(await crypto.subtle.digest(algorithm, buffer))].map((b) => b.toString(16).padStart(2, "0")).join("");
        return {
            md5: SparkMD5.ArrayBuffer.hash(buffer),
            sha1: await digest("SHA-1"),
            sha256: await digest("SHA-256"),
            sha512: await digest("SHA-512")
        };
    };

    $effect(() => {
        const input = text;
        if (fileName) return;
        if (input === "") {
            hashes = { md5: "", sha1: "", sha256: "", sha512: "" };
            return;
        }
        const current = {
            md5: md5(input),
            sha1: "",
            sha256: "",
            sha512: ""
        };
        hashes = current;
        Promise.all([shaHash(input, "SHA-1"), shaHash(input, "SHA-256"), shaHash(input, "SHA-512")]).then(([sha1, sha256, sha512]) => {
            if (text === input && !fileName) hashes = { ...current, sha1, sha256, sha512 };
        });
    });

    const onFile = async (event) => {
        error = "";
        const file = event.currentTarget.files[0];
        if (!file) {
            fileName = "";
            return;
        }
        fileName = file.name;
        try {
            hashes = await hashBytes(await file.arrayBuffer());
        } catch (e) {
            error = `Could not read file: ${e.message}`;
        }
    };

    const clearFile = (event) => {
        fileName = "";
        document.getElementById("file").value = "";
        hashes = { md5: "", sha1: "", sha256: "", sha512: "" };
        event.currentTarget.blur();
    };
</script>

<svelte:head>
    <title>Calculate MD5 | Mools</title>
</svelte:head>

<h1>Calculate MD5</h1>
<p class="text-body-secondary mb-3">
    Hash text or a file. MD5 and SHA-1 are fine for checksums but are not secure for passwords or signatures.
</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="text" class="form-label">Text</label>
                <textarea id="text" class="form-control font-monospace" rows="6" bind:value={text} disabled={!!fileName} placeholder="Enter text to hash"></textarea>
            </div>
            <div class="mb-0">
                <label for="file" class="form-label">Or a file</label>
                <div class="input-group">
                    <input id="file" class="form-control" type="file" onchange={onFile} />
                    {#if fileName}
                        <button class="btn btn-outline-secondary" type="button" onclick={clearFile}>Clear</button>
                    {/if}
                </div>
            </div>
            {#if error}
                <div class="alert alert-danger py-2 mt-3 mb-0" role="alert">{error}</div>
            {/if}
        </div>
    </div>
    <div class="col-lg-6 d-flex flex-column gap-3">
        <OutputCard title="MD5" text={hashes.md5} />
        <OutputCard title="SHA-1" text={hashes.sha1} />
        <OutputCard title="SHA-256" text={hashes.sha256} />
        <OutputCard title="SHA-512" text={hashes.sha512} />
    </div>
</div>
