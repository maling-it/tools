<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { basicAuthHeader } from "#lib/netSecurity.js";

    let user = $state("");
    let password = $state("");

    const header = $derived(user || password ? basicAuthHeader(user, password) : "");
</script>

<svelte:head>
    <title>Basic Auth Generator | Mools</title>
</svelte:head>

<h1>Basic Auth Generator</h1>
<p class="text-body-secondary mb-3">Generate the HTTP Basic Authorization header for a username and password.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="user" class="form-label">Username</label>
                <input id="user" class="form-control" bind:value={user} autocomplete="off" />
            </div>
            <div>
                <label for="password" class="form-label">Password</label>
                <input id="password" class="form-control" type="password" bind:value={password} autocomplete="off" />
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        <OutputCard title="Header" text={header} />
    </div>
</div>
