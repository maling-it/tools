<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { PROMPT_STYLES, buildPrompt, estimateTokens } from "#lib/vibe.js";

    let form = $state({ role: "", context: "", task: "", constraints: "", outputFormat: "", examples: "" });
    let style = $state("markdown");

    const result = $derived.by(() => {
        try {
            const text = buildPrompt({ ...form, style });
            return { text, tokens: estimateTokens(text).tokens, error: "" };
        } catch (e) {
            return { text: "", tokens: 0, error: e.message };
        }
    });

    const fields = [
        ["role", "Role", "You are a senior TypeScript engineer who writes small, well-tested code.", 2],
        ["context", "Context", "What the project is, what already exists, relevant files or errors.", 4],
        ["task", "Task", "The one thing you want done, stated clearly.", 3],
        ["constraints", "Constraints (one per line)", "Do not add dependencies\nKeep changes under 50 lines", 3],
        ["outputFormat", "Output format", "A short plan first, then a unified diff.", 2],
        ["examples", "Examples", "Show an input and the output you expect.", 3]
    ];
</script>

<svelte:head>
    <title>Prompt Builder | Mools</title>
</svelte:head>

<h1>Prompt Builder</h1>
<p class="text-body-secondary mb-3">Structure a clear prompt for any AI assistant: role, context, task, constraints, output format and examples. Empty sections are left out.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            {#each fields as [key, label, placeholder, rows] (key)}
                <div class="mb-3">
                    <label for={key} class="form-label">{label}</label>
                    <textarea id={key} class="form-control" {rows} {placeholder} bind:value={form[key]}></textarea>
                </div>
            {/each}
            <div>
                <label for="style" class="form-label">Format</label>
                <select id="style" class="form-select w-auto" bind:value={style}>
                    {#each Object.entries(PROMPT_STYLES) as [id, name] (id)}
                        <option value={id}>{name}</option>
                    {/each}
                </select>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        {#if result.error}
            <div class="card p-3 text-body-secondary">{result.error}</div>
        {:else}
            <OutputCard title="Prompt (about {result.tokens} tokens)" text={result.text} filename="prompt.md" mime="text/markdown" />
        {/if}
    </div>
</div>
