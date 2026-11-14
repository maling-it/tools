<script>
    import { onMount } from "svelte";
    import StatRows from "../../../components/StatRows.svelte";
    import { parseDateInput, describeDate } from "#lib/devUtils.js";

    let input = $state("");
    let now = $state(0);

    onMount(() => {
        now = Date.now();
        input = String(Math.floor(now / 1000));
        const timer = setInterval(() => (now = Date.now()), 1000);
        return () => clearInterval(timer);
    });

    const result = $derived.by(() => {
        if (!input.trim()) return { rows: [], error: "" };
        try {
            const d = describeDate(parseDateInput(input), now || Date.now());
            return { rows: [["Unix (seconds)", d.unixSeconds], ["Unix (milliseconds)", d.unixMilliseconds], ["ISO 8601", d.iso8601], ["UTC", d.utc], ["Local time", d.local], ["Relative", d.relative]], error: "" };
        } catch (e) {
            return { rows: [], error: e.message };
        }
    });
</script>

<svelte:head>
    <title>Unix Timestamp Converter | Mools</title>
</svelte:head>

<h1>Unix Timestamp Converter</h1>
<p class="text-body-secondary mb-3">Convert Unix timestamps (seconds or milliseconds) and date strings into every common format.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <label for="input" class="form-label">Timestamp or date</label>
            <input id="input" class="form-control font-monospace mb-3" placeholder="1700000000 or 2023-11-14T22:13:20Z" bind:value={input} spellcheck="false" />
            <div class="d-flex gap-2 align-items-center">
                <button class="btn btn-outline-primary btn-sm" type="button" onclick={() => (input = String(Math.floor(Date.now() / 1000)))}>Now</button>
                <span class="text-body-secondary small">Current time: {now ? Math.floor(now / 1000) : "..."}</span>
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {:else if result.rows.length}
            <StatRows title="Results" copyable rows={result.rows} />
        {/if}
    </div>
</div>
