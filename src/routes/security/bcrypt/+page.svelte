<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { bcryptHash, bcryptCompare } from "#lib/netSecurity.js";

    let password = $state("");
    let rounds = $state(10);
    let hash = $state("");
    let compareHash = $state("");
    let comparePassword = $state("");
    let matches = $state(null);
    let busy = $state(false);
    let error = $state("");

    const generate = async () => {
        error = "";
        busy = true;
        try {
            hash = await bcryptHash(password, Number(rounds));
        } catch (e) {
            error = e.message;
        } finally {
            busy = false;
        }
    };

    const compare = async () => {
        error = "";
        matches = null;
        busy = true;
        try {
            matches = await bcryptCompare(comparePassword, compareHash);
        } catch {
            error = "That does not look like a valid bcrypt hash.";
        } finally {
            busy = false;
        }
    };
</script>

<svelte:head>
    <title>Bcrypt Hash Generator | Mools</title>
</svelte:head>

<h1>Bcrypt Hash Generator</h1>
<p class="text-body-secondary mb-3">Hash a password with bcrypt, or check a password against a hash. Everything runs in your browser. Higher rounds are slower.</p>

{#if error}
    <div class="alert alert-danger" role="alert">{error}</div>
{/if}

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3 h-100">
            <h2 class="h5 card-title">Hash</h2>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input id="password" class="form-control" bind:value={password} autocomplete="off" />
            </div>
            <div class="mb-3">
                <label for="rounds" class="form-label">Rounds (cost): {rounds}</label>
                <input id="rounds" class="form-range" type="range" min="4" max="14" bind:value={rounds} />
            </div>
            <div class="mb-3">
                <button class="btn btn-primary" type="button" disabled={busy || !password} onclick={generate}>{busy ? "Working..." : "Generate hash"}</button>
            </div>
            <OutputCard title="Hash" text={hash} />
        </div>
    </div>
    <div class="col-lg-6">
        <div class="card p-3 h-100">
            <h2 class="h5 card-title">Compare</h2>
            <div class="mb-3">
                <label for="compare-password" class="form-label">Password</label>
                <input id="compare-password" class="form-control" bind:value={comparePassword} autocomplete="off" />
            </div>
            <div class="mb-3">
                <label for="compare-hash" class="form-label">Bcrypt hash</label>
                <input id="compare-hash" class="form-control font-monospace" bind:value={compareHash} spellcheck="false" />
            </div>
            <div class="mb-3">
                <button class="btn btn-primary" type="button" disabled={busy || !comparePassword || !compareHash} onclick={compare}>Compare</button>
            </div>
            {#if matches !== null}
                <div class="alert {matches ? 'alert-success' : 'alert-danger'} mb-0" role="status">{matches ? "The password matches the hash." : "The password does not match."}</div>
            {/if}
        </div>
    </div>
</div>
