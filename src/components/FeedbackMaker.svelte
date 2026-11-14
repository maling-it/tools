<script>
    import ResultList from "./ResultList.svelte";
    import { feedbackOptions } from "#lib/generators.js";

    let { platform, name, role = "seller" } = $props();

    let tone = $state("positive");
    const items = $derived(feedbackOptions(platform, tone));
</script>

<svelte:head>
    <title>{name} Feedback Maker | Mools</title>
</svelte:head>

<h1>{name} Feedback Maker</h1>
<p class="text-body-secondary mb-3">
    Pick a tone and copy a ready-made {name} feedback message. Edit it to describe your own experience before posting.
</p>

<div class="card p-3 mb-3">
    <label for="tone" class="form-label">Feedback tone</label>
    <select id="tone" class="form-select w-auto" bind:value={tone}>
        <option value="positive">Positive</option>
        <option value="neutral">Neutral</option>
        <option value="negative">Negative</option>
    </select>
</div>

<ResultList {items} title="Suggested feedback" />
