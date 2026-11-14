<script>
    import { textDiff, jsonDiff } from "#lib/formatters.js";

    let { kind = "text", title, description } = $props();

    let a = $state("");
    let b = $state("");
    let mode = $state("lines");

    const result = $derived.by(() => {
        if (a === "" && b === "") return { parts: [], error: "" };
        try {
            return { parts: kind === "json" ? jsonDiff(a || "null", b || "null") : textDiff(a, b, { mode }), error: "" };
        } catch (e) {
            return { parts: [], error: e.message };
        }
    });

    const identical = $derived((a !== "" || b !== "") && !result.error && result.parts.every((p) => p.type === "same"));
</script>

<svelte:head>
    <title>{title} | Mools</title>
</svelte:head>

<h1>{title}</h1>
<p class="text-body-secondary mb-3">{description}</p>

<div class="row g-3 mb-3">
    <div class="col-md-6">
        <label for="original" class="form-label">Original</label>
        <textarea id="original" class="form-control font-monospace" rows="10" spellcheck="false" bind:value={a}></textarea>
    </div>
    <div class="col-md-6">
        <label for="changed" class="form-label">Changed</label>
        <textarea id="changed" class="form-control font-monospace" rows="10" spellcheck="false" bind:value={b}></textarea>
    </div>
</div>

{#if kind === "text"}
    <div class="mb-3">
        <label for="mode" class="form-label">Compare by</label>
        <select id="mode" class="form-select w-auto" bind:value={mode}>
            <option value="lines">Lines</option>
            <option value="words">Words</option>
        </select>
    </div>
{/if}

{#if result.error}
    <div class="alert alert-danger" role="alert">{result.error}</div>
{:else if identical}
    <div class="alert alert-success" role="status">Both sides are identical.</div>
{:else if result.parts.length > 0}
    <div class="card p-3">
        <h2 class="h5 card-title">Differences</h2>
        <pre class="mb-0 diff">{#each result.parts as part, index (index)}<span class={part.type}>{part.value}</span>{/each}</pre>
    </div>
{/if}

<style>
    .diff {
        white-space: pre-wrap;
        word-break: break-word;
    }

    .added {
        background: var(--bs-success-bg-subtle);
        color: var(--bs-success-text-emphasis);
    }

    .removed {
        background: var(--bs-danger-bg-subtle);
        color: var(--bs-danger-text-emphasis);
        text-decoration: line-through;
    }
</style>
