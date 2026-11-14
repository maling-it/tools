<script>
    import { onMount } from "svelte";

    let elapsed = $state(0);
    let running = $state(false);
    let laps = $state([]);
    let startedAt = 0;
    let base = 0;
    let frame = 0;

    const tick = () => {
        elapsed = base + (performance.now() - startedAt);
        frame = requestAnimationFrame(tick);
    };

    const start = () => {
        startedAt = performance.now();
        running = true;
        frame = requestAnimationFrame(tick);
    };

    const stop = () => {
        cancelAnimationFrame(frame);
        base = elapsed;
        running = false;
    };

    const reset = () => {
        stop();
        base = elapsed = 0;
        laps = [];
    };

    const lap = () => laps.unshift(elapsed);

    onMount(() => () => cancelAnimationFrame(frame));

    const format = (ms) => {
        const total = Math.floor(ms);
        const h = Math.floor(total / 3600000);
        const m = Math.floor((total % 3600000) / 60000);
        const s = Math.floor((total % 60000) / 1000);
        const cs = Math.floor((total % 1000) / 10);
        return `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
    };
</script>

<svelte:head>
    <title>Chronometer | Mools</title>
</svelte:head>

<h1>Chronometer</h1>
<p class="text-body-secondary mb-3">A stopwatch with lap times.</p>

<div class="card p-4 text-center mx-auto" style="max-width: 32rem;">
    <div class="display-3 font-monospace fw-bold mb-3" aria-live="off">{format(elapsed)}</div>
    <div class="d-flex gap-2 justify-content-center mb-3">
        {#if running}
            <button class="btn btn-danger btn-lg" type="button" onclick={stop}>Stop</button>
            <button class="btn btn-outline-secondary btn-lg" type="button" onclick={lap}>Lap</button>
        {:else}
            <button class="btn btn-success btn-lg" type="button" onclick={start}>{elapsed > 0 ? "Resume" : "Start"}</button>
            <button class="btn btn-outline-secondary btn-lg" type="button" disabled={elapsed === 0} onclick={reset}>Reset</button>
        {/if}
    </div>
    {#if laps.length}
        <ol class="list-group list-group-numbered text-start" reversed>
            {#each laps as time, i (i)}
                <li class="list-group-item font-monospace">{format(time)}</li>
            {/each}
        </ol>
    {/if}
</div>
