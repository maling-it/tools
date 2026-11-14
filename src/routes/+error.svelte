<script>
    import { page } from "$app/state";
    import { resolve } from "$app/paths";
</script>

<svelte:head>
    <title>{page.status} | Mools</title>
</svelte:head>

<div class="text-center py-5">
    <h1 class="display-1 fw-bold">{page.status}</h1>
    <p class="lead text-body-secondary">
        {page.status === 404 ? "We couldn't find that page." : (page.error?.message ?? "Something went wrong.")}
    </p>
    <a href={resolve("/")} class="btn btn-primary">Back to home</a>
</div>
