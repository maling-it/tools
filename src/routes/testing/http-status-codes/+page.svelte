<script>
    import { HTTP_STATUS } from "#lib/reference.js";

    let query = $state("");

    const classes = { 1: "Informational", 2: "Success", 3: "Redirection", 4: "Client error", 5: "Server error" };
    const colors = { 1: "secondary", 2: "success", 3: "info", 4: "warning", 5: "danger" };

    const filtered = $derived(
        HTTP_STATUS.filter((s) => `${s.code} ${s.name} ${s.description}`.toLowerCase().includes(query.trim().toLowerCase()))
    );
</script>

<svelte:head>
    <title>HTTP Status Codes | Mools</title>
</svelte:head>

<h1>HTTP Status Codes</h1>
<p class="text-body-secondary mb-3">A searchable reference of HTTP response status codes.</p>

<input class="form-control mb-3" type="search" placeholder="Search by code, name or meaning" aria-label="Search status codes" bind:value={query} />

<div class="card">
    <ul class="list-group list-group-flush">
        {#each filtered as status (status.code)}
            {@const group = Math.floor(status.code / 100)}
            <li class="list-group-item d-flex gap-3 align-items-start">
                <span class="badge text-bg-{colors[group]} fs-6" title={classes[group]} style="min-width: 3.5rem;">{status.code}</span>
                <div>
                    <div class="fw-semibold">{status.name}</div>
                    <div class="text-body-secondary small">{status.description}</div>
                </div>
            </li>
        {:else}
            <li class="list-group-item text-body-secondary">No status codes match "{query}".</li>
        {/each}
    </ul>
</div>
