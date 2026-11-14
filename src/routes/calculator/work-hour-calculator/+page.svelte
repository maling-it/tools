<script>
    import { onMount } from "svelte";
    import StatRows from "../../../components/StatRows.svelte";
    import { workMinutes, formatMinutes } from "#lib/calculators.js";

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const KEY = "mools-work-hours";

    let rows = $state(days.map((day, i) => ({ day, start: i < 5 ? "09:00" : "", end: i < 5 ? "17:00" : "", breakMinutes: i < 5 ? 30 : 0 })));
    let rate = $state(0);
    let loaded = false;

    onMount(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(KEY));
            if (saved?.rows?.length === 7) {
                rows = saved.rows;
                rate = saved.rate ?? 0;
            }
        } catch {
            // Ignore unreadable saved data and keep the defaults.
        }
        loaded = true;
    });

    $effect(() => {
        const snapshot = JSON.stringify({ rows, rate });
        if (!loaded) return;
        try {
            localStorage.setItem(KEY, snapshot);
        } catch {
            // Storage can be unavailable; hours then only live for this visit.
        }
    });

    const minutes = $derived(rows.map((row) => workMinutes(row.start, row.end, row.breakMinutes)));
    const total = $derived(minutes.reduce((sum, m) => sum + m, 0));
    const workedDays = $derived(minutes.filter((m) => m > 0).length);
</script>

<svelte:head>
    <title>Work Hour Calculator | Mools</title>
</svelte:head>

<h1>Work Hour Calculator</h1>
<p class="text-body-secondary mb-3">Enter start and end times for each day to total your weekly hours. Shifts that end after midnight are supported. Your entries are saved in this browser.</p>

<div class="row g-3">
    <div class="col-lg-8">
        <div class="card p-3">
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead>
                        <tr><th>Day</th><th>Start</th><th>End</th><th>Break (min)</th><th class="text-end">Total</th></tr>
                    </thead>
                    <tbody>
                        {#each rows as row, index (row.day)}
                            <tr>
                                <th scope="row" class="fw-normal">{row.day}</th>
                                <td><input class="form-control form-control-sm" type="time" aria-label="{row.day} start" bind:value={row.start} /></td>
                                <td><input class="form-control form-control-sm" type="time" aria-label="{row.day} end" bind:value={row.end} /></td>
                                <td><input class="form-control form-control-sm" type="number" min="0" aria-label="{row.day} break" bind:value={row.breakMinutes} style="max-width: 5.5rem" /></td>
                                <td class="text-end">{formatMinutes(minutes[index])}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="col-lg-4 d-flex flex-column gap-3">
        <div class="card p-3">
            <label for="rate" class="form-label">Hourly rate (optional)</label>
            <input id="rate" class="form-control" type="number" min="0" step="any" bind:value={rate} />
        </div>
        <StatRows
            rows={[
                ["Days worked", workedDays],
                ["Total time", formatMinutes(total)],
                ["Decimal hours", (total / 60).toFixed(2)],
                ...(rate > 0 ? [["Earnings", ((total / 60) * rate).toLocaleString(undefined, { maximumFractionDigits: 2 })]] : [])
            ]}
        />
    </div>
</div>
