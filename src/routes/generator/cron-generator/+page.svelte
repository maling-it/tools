<script>
    import StatRows from "../../../components/StatRows.svelte";
    import { explainCron, nextCronRuns } from "#lib/formatters.js";

    let expression = $state("*/15 9-17 * * 1-5");

    const presets = [
        ["Every minute", "* * * * *"],
        ["Every 5 minutes", "*/5 * * * *"],
        ["Hourly", "0 * * * *"],
        ["Daily at midnight", "0 0 * * *"],
        ["Weekdays at 9:00", "0 9 * * 1-5"],
        ["Weekly on Sunday", "0 0 * * 0"],
        ["Monthly on the 1st", "0 0 1 * *"]
    ];

    const result = $derived.by(() => {
        try {
            const description = explainCron(expression);
            return { description, runs: nextCronRuns(expression, 5), error: "" };
        } catch (e) {
            return { description: "", runs: [], error: e.message };
        }
    });

    const fieldNames = ["Minute", "Hour", "Day of month", "Month", "Day of week"];
</script>

<svelte:head>
    <title>Crontab Generator | Mools</title>
</svelte:head>

<h1>Crontab Generator</h1>
<p class="text-body-secondary mb-3">Write a cron expression and see what it means in plain English, plus its next run times in your local time zone.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <label for="cron" class="form-label">Cron expression</label>
            <input id="cron" class="form-control form-control-lg font-monospace mb-2" bind:value={expression} spellcheck="false" />
            <div class="d-flex text-body-secondary small font-monospace mb-3 flex-wrap gap-2">
                {#each fieldNames as name (name)}<span>{name}</span>{/each}
            </div>
            <div class="d-flex flex-wrap gap-2">
                {#each presets as [label, value] (value)}
                    <button class="btn btn-sm btn-outline-secondary" type="button" onclick={() => (expression = value)}>{label}</button>
                {/each}
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {:else}
            <div class="card p-3 mb-3">
                <h2 class="h5 card-title">Meaning</h2>
                <p class="mb-0 fs-5">{result.description}</p>
            </div>
            <StatRows title="Next runs" rows={result.runs.map((date, i) => [`#${i + 1}`, date.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })])} />
        {/if}
    </div>
</div>
