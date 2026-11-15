<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { generateRsaKeyPair } from "#lib/utilities.js";
    import { announce } from "#lib/announce.svelte.js";

    let bits = $state(2048);
    let usage = $state("sign");
    let keys = $state({ privateKey: "", publicKey: "" });
    let busy = $state(false);
    let error = $state("");

    const generate = async () => {
        busy = true;
        error = "";
        try {
            keys = await generateRsaKeyPair({ bits, usage });
            announce("RSA key pair generated");
        } catch (e) {
            error = e.message;
        } finally {
            busy = false;
        }
    };
</script>

<svelte:head>
    <title>RSA Key Pair Generator | Mools</title>
</svelte:head>

<h1>RSA Key Pair Generator</h1>
<p class="text-body-secondary mb-3">
    Generate an RSA key pair with your browser's Web Crypto. The private key is created on this page and is never sent anywhere. For keys that protect something important, generate them on the machine that will use them.
</p>

<div class="card p-3 mb-3">
    <div class="d-flex flex-wrap gap-3 align-items-end">
        <div>
            <label for="rsa-bits" class="form-label">Key size</label>
            <select id="rsa-bits" class="form-select" bind:value={bits}>
                <option value={2048}>2048 bits</option>
                <option value={3072}>3072 bits</option>
                <option value={4096}>4096 bits (slow)</option>
            </select>
        </div>
        <div>
            <label for="rsa-usage" class="form-label">Use for</label>
            <select id="rsa-usage" class="form-select" bind:value={usage}>
                <option value="sign">Signing (RSASSA-PKCS1-v1_5)</option>
                <option value="encrypt">Encryption (RSA-OAEP)</option>
            </select>
        </div>
        <button class="btn btn-primary" type="button" onclick={generate} disabled={busy}>{busy ? "Generating..." : "Generate key pair"}</button>
    </div>
    {#if error}<div class="alert alert-danger mt-3 mb-0" role="alert">{error}</div>{/if}
</div>

<div class="row g-3">
    <div class="col-lg-6"><OutputCard title="Public key (SPKI)" text={keys.publicKey} filename="public.pem" /></div>
    <div class="col-lg-6"><OutputCard title="Private key (PKCS#8)" text={keys.privateKey} filename="private.pem" /></div>
</div>
