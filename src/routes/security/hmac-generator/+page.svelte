<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { hmac } from "#lib/netSecurity.js";

    let message = $state("");
    let key = $state("");
    let algorithm = $state("SHA-256");
    let encoding = $state("hex");
    let output = $state("");
    let error = $state("");

    $effect(() => {
        const [m, k, a, e] = [message, key, algorithm, encoding];
        if (!m || !k) {
            output = error = "";
            return;
        }
        hmac(m, k, a, e).then(
            (value) => {
                if (m === message && k === key) [output, error] = [value, ""];
            },
            (err) => ([output, error] = ["", err.message])
        );
    });
</script>

<svelte:head>
    <title>HMAC Generator | Mools</title>
</svelte:head>

<h1>HMAC Generator</h1>
<p class="text-body-secondary mb-3">Compute a keyed-hash message authentication code with the Web Crypto API.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="message" class="form-label">Message</label>
                <textarea id="message" class="form-control font-monospace" rows="5" bind:value={message} spellcheck="false"></textarea>
            </div>
            <div class="mb-3">
                <label for="key" class="form-label">Secret key</label>
                <input id="key" class="form-control font-monospace" bind:value={key} autocomplete="off" spellcheck="false" />
            </div>
            <div class="d-flex gap-3 flex-wrap">
                <div>
                    <label for="algorithm" class="form-label">Algorithm</label>
                    <select id="algorithm" class="form-select" bind:value={algorithm}>
                        {#each ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as name (name)}<option>{name}</option>{/each}
                    </select>
                </div>
                <div>
                    <label for="encoding" class="form-label">Output</label>
                    <select id="encoding" class="form-select" bind:value={encoding}>
                        <option value="hex">Hex</option>
                        <option value="base64">Base64</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        {#if error}
            <div class="alert alert-danger" role="alert">{error}</div>
        {/if}
        <OutputCard title="HMAC" text={output} />
    </div>
</div>
