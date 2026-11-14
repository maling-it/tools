<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { COMMIT_TYPES, buildCommitMessage } from "#lib/vibe.js";

    let form = $state({ type: "feat", scope: "", description: "", body: "", breaking: false, breakingNote: "", issues: "" });

    const result = $derived.by(() => {
        try {
            return { text: buildCommitMessage(form), error: "" };
        } catch (e) {
            return { text: "", error: form.description ? e.message : "" };
        }
    });
</script>

<svelte:head>
    <title>Commit Message Builder | Mools</title>
</svelte:head>

<h1>Commit Message Builder</h1>
<p class="text-body-secondary mb-3">Write a clean Conventional Commits message. Keep the subject short and explain why in the body.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="row g-2 mb-3">
                <div class="col-5">
                    <label for="type" class="form-label">Type</label>
                    <select id="type" class="form-select" bind:value={form.type}>
                        {#each COMMIT_TYPES as type (type)}<option>{type}</option>{/each}
                    </select>
                </div>
                <div class="col-7">
                    <label for="scope" class="form-label">Scope (optional)</label>
                    <input id="scope" class="form-control" placeholder="api" bind:value={form.scope} />
                </div>
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">Short description</label>
                <input id="description" class="form-control" placeholder="add password strength meter" bind:value={form.description} />
                <div class="form-text">{`${form.type}${form.scope ? `(${form.scope})` : ""}: ${form.description}`.length} characters in the subject (aim for 72 or fewer).</div>
            </div>
            <div class="mb-3">
                <label for="body" class="form-label">Body (why, optional)</label>
                <textarea id="body" class="form-control" rows="4" bind:value={form.body}></textarea>
            </div>
            <div class="mb-3">
                <label for="issues" class="form-label">Closes issues (optional)</label>
                <input id="issues" class="form-control" placeholder="12, 15" bind:value={form.issues} />
            </div>
            <div class="form-check mb-2">
                <input id="breaking" class="form-check-input" type="checkbox" bind:checked={form.breaking} />
                <label class="form-check-label" for="breaking">Breaking change</label>
            </div>
            {#if form.breaking}
                <input class="form-control" aria-label="Breaking change description" placeholder="What breaks and how to migrate" bind:value={form.breakingNote} />
            {/if}
        </div>
    </div>
    <div class="col-lg-6">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {/if}
        <OutputCard title="Commit message" text={result.text} />
        {#if result.text}
            <p class="small text-body-secondary mt-2">Use it with <code>git commit -s -m "..."</code> or paste it into your editor.</p>
        {/if}
    </div>
</div>
