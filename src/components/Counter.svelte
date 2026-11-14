<script>
    import { onMount } from "svelte";

    let { mode } = $props();

    let count = $state(0);
    let step = $state(1);
    let startedAt = $state(0);
    let now = $state(0);

    onMount(() => {
        const timer = setInterval(() => (now = performance.now()), 200);
        return () => clearInterval(timer);
    });

    const cps = $derived(startedAt && now > startedAt ? count / ((now - startedAt) / 1000) : 0);

    const click = () => {
        if (!startedAt) startedAt = now = performance.now();
        count += 1;
        now = performance.now();
    };

    const reset = () => {
        count = 0;
        startedAt = 0;
    };

    // svelte-ignore state_referenced_locally
    const title = mode === "click" ? "Click Counter" : "Easy Counter";
</script>

<svelte:head>
    <title>{title} | Mools</title>
</svelte:head>

<h1>{title}</h1>
<p class="text-body-secondary mb-3">
    {mode === "click" ? "Click the big button as fast as you can and see your clicks per second." : "A simple counter with add, subtract and reset."}
</p>

<div class="card p-4 text-center">
    <div class="display-1 fw-bold mb-3" aria-live="polite">{count}</div>

    {#if mode === "click"}
        <div class="mb-3">
            <button class="btn btn-primary btn-lg px-5 py-4 fs-3" type="button" onclick={click}>Click!</button>
        </div>
        <p class="text-body-secondary">{cps.toFixed(2)} clicks per second</p>
    {:else}
        <div class="d-flex gap-2 justify-content-center mb-3">
            <button class="btn btn-outline-secondary btn-lg" type="button" aria-label="Subtract" onclick={() => (count -= step)}>
                <i class="bi bi-dash-lg"></i>
            </button>
            <button class="btn btn-primary btn-lg" type="button" aria-label="Add" onclick={() => (count += step)}>
                <i class="bi bi-plus-lg"></i>
            </button>
        </div>
        <div class="d-flex gap-2 justify-content-center align-items-center mb-3">
            <label for="step" class="form-label mb-0">Step</label>
            <input id="step" class="form-control w-auto" type="number" min="1" bind:value={step} style="max-width: 6rem" />
        </div>
    {/if}

    <div>
        <button class="btn btn-outline-danger" type="button" onclick={reset}>Reset</button>
    </div>
</div>
