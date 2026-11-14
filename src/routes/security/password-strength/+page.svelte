<script>
    import StatRows from "../../../components/StatRows.svelte";
    import { passwordStrength } from "#lib/netSecurity.js";

    let password = $state("");
    let visible = $state(false);

    const result = $derived(password ? passwordStrength(password) : null);
    const colors = { "Very weak": "danger", Weak: "danger", Fair: "warning", Strong: "success", "Very strong": "success" };
</script>

<svelte:head>
    <title>Password Strength Analyser | Mools</title>
</svelte:head>

<h1>Password Strength Analyser</h1>
<p class="text-body-secondary mb-3">Estimate how long a password would resist guessing. The password never leaves your browser. This is an estimate, not a guarantee.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <label for="password" class="form-label">Password</label>
            <div class="input-group">
                <input id="password" class="form-control font-monospace" type={visible ? "text" : "password"} bind:value={password} autocomplete="off" spellcheck="false" />
                <button class="btn btn-outline-secondary" type="button" aria-label={visible ? "Hide password" : "Show password"} onclick={() => (visible = !visible)}>
                    <i class="bi {visible ? 'bi-eye-slash' : 'bi-eye'}"></i>
                </button>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        {#if result}
            <div class="card p-3">
                <h2 class="h5 card-title"><span class="badge text-bg-{colors[result.label]}">{result.label}</span></h2>
                <div class="progress mb-3" role="progressbar" aria-label="Strength" aria-valuenow={Math.min(result.bits, 100)} aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-bar bg-{colors[result.label]}" style="width: {Math.min(result.bits, 100)}%"></div>
                </div>
                <table class="table table-sm mb-3">
                    <tbody>
                        <tr><th scope="row" class="fw-normal">Entropy</th><td class="text-end fw-semibold">{result.bits} bits</td></tr>
                        <tr><th scope="row" class="fw-normal">Time to crack*</th><td class="text-end fw-semibold">{result.crackTime}</td></tr>
                    </tbody>
                </table>
                {#if result.warnings.length}
                    <ul class="small mb-2">
                        {#each result.warnings as warning (warning)}<li>{warning}</li>{/each}
                    </ul>
                {/if}
                <p class="small text-body-secondary mb-0">*Offline attack at 10 billion guesses per second.</p>
            </div>
        {/if}
    </div>
</div>
