<script>
    import { onMount } from "svelte";
    import { totp, randomBase32Secret } from "#lib/netSecurity.js";
    import { copyToClipboard } from "#lib/textUtils.js";

    let secret = $state("");
    let digits = $state(6);
    let period = $state(30);
    let algorithm = $state("SHA-1");
    let now = $state(0);
    let code = $state("");
    let error = $state("");
    let copied = $state(false);

    onMount(() => {
        now = Date.now();
        const timer = setInterval(() => (now = Date.now()), 500);
        return () => clearInterval(timer);
    });

    const remaining = $derived(now ? period - (Math.floor(now / 1000) % period) : period);

    $effect(() => {
        const [s, d, p, a, t] = [secret, Number(digits), Number(period), algorithm, now];
        if (!s.trim() || !t) {
            code = error = "";
            return;
        }
        totp({ secret: s, digits: d, period: p, algorithm: a, time: t }).then(
            (value) => ([code, error] = [value, ""]),
            (err) => ([code, error] = ["", err.message])
        );
    });

    const copy = async () => {
        if (await copyToClipboard(code)) {
            copied = true;
            setTimeout(() => (copied = false), 1200);
        }
    };
</script>

<svelte:head>
    <title>TOTP Generator | Mools</title>
</svelte:head>

<h1>TOTP Generator</h1>
<p class="text-body-secondary mb-3">Generate time-based one-time passwords (RFC 6238) like authenticator apps do. Handy for testing two-factor setups. Your secret stays in your browser.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="secret" class="form-label">Base32 secret</label>
                <div class="input-group">
                    <input id="secret" class="form-control font-monospace" bind:value={secret} autocomplete="off" spellcheck="false" placeholder="JBSWY3DPEHPK3PXP" />
                    <button class="btn btn-outline-secondary" type="button" onclick={() => (secret = randomBase32Secret(32))}>Random</button>
                </div>
            </div>
            <div class="d-flex gap-3 flex-wrap">
                <div>
                    <label for="digits" class="form-label">Digits</label>
                    <select id="digits" class="form-select" bind:value={digits}>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                    </select>
                </div>
                <div>
                    <label for="period" class="form-label">Period (s)</label>
                    <input id="period" class="form-control" type="number" min="1" bind:value={period} style="max-width: 7rem" />
                </div>
                <div>
                    <label for="algorithm" class="form-label">Algorithm</label>
                    <select id="algorithm" class="form-select" bind:value={algorithm}>
                        <option>SHA-1</option>
                        <option>SHA-256</option>
                        <option>SHA-512</option>
                    </select>
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        {#if error}
            <div class="alert alert-danger" role="alert">{error}</div>
        {:else}
            <div class="card p-4 text-center">
                <div class="display-4 font-monospace fw-bold mb-2" aria-live="off">{code || "------"}</div>
                <div class="progress mb-2" role="progressbar" aria-label="Time until the code changes" aria-valuenow={remaining} aria-valuemin="0" aria-valuemax={period}>
                    <div class="progress-bar" style="width: {(remaining / period) * 100}%"></div>
                </div>
                <p class="text-body-secondary small mb-3">Changes in {remaining}s</p>
                <div>
                    <button class="btn btn-outline-secondary" type="button" disabled={!code} onclick={copy}>
                        <i class="bi {copied ? 'bi-check2' : 'bi-clipboard'} me-1"></i>{copied ? "Copied" : "Copy"}
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>
