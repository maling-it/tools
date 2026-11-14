<script>
    import { PROMPTS, PROMPT_CATEGORIES } from "#lib/prompts.js";
    import { extractVariables, fillTemplate } from "#lib/vibe.js";
    import { copyToClipboard } from "#lib/textUtils.js";

    let query = $state("");
    let category = $state("All");
    let openId = $state("");
    let values = $state({});
    let copiedId = $state("");

    const filtered = $derived(
        PROMPTS.filter(
            (p) => (category === "All" || p.category === category) && `${p.title} ${p.prompt} ${p.category}`.toLowerCase().includes(query.trim().toLowerCase())
        )
    );

    const filled = (prompt) => fillTemplate(prompt.prompt, values[prompt.id] ?? {});

    const copy = async (prompt) => {
        if (await copyToClipboard(filled(prompt))) {
            copiedId = prompt.id;
            setTimeout(() => (copiedId = ""), 1200);
        }
    };

    const toggle = (id) => (openId = openId === id ? "" : id);
    const setValue = (id, name, value) => (values[id] = { ...(values[id] ?? {}), [name]: value });
</script>

<svelte:head>
    <title>Prompt Library | Mools</title>
</svelte:head>

<h1>Prompt Library</h1>
<p class="text-body-secondary mb-3">
    {PROMPTS.length} ready-to-use prompts for planning, building, debugging, testing and reviewing code with AI. Open one, fill in the blanks and copy it.
</p>

<div class="row g-2 mb-3">
    <div class="col-md-8">
        <input class="form-control" type="search" placeholder="Search prompts" aria-label="Search prompts" bind:value={query} />
    </div>
    <div class="col-md-4">
        <select class="form-select" aria-label="Category" bind:value={category}>
            <option>All</option>
            {#each PROMPT_CATEGORIES as name (name)}<option>{name}</option>{/each}
        </select>
    </div>
</div>

<div class="d-flex flex-column gap-2">
    {#each filtered as prompt (prompt.id)}
        {@const variables = extractVariables(prompt.prompt)}
        <div class="card">
            <button class="btn text-start d-flex align-items-center gap-2 p-3" type="button" aria-expanded={openId === prompt.id} onclick={() => toggle(prompt.id)}>
                <span class="fw-semibold me-auto">{prompt.title}</span>
                <span class="badge bg-body-secondary text-body-secondary fw-normal">{prompt.category}</span>
                <i class="bi {openId === prompt.id ? 'bi-chevron-up' : 'bi-chevron-down'}"></i>
            </button>
            {#if openId === prompt.id}
                <div class="px-3 pb-3">
                    {#if variables.length}
                        <div class="row g-2 mb-3">
                            {#each variables as name (name)}
                                <div class="col-md-6">
                                    <label for="{prompt.id}-{name}" class="form-label small mb-0">{name}</label>
                                    <input
                                        id="{prompt.id}-{name}"
                                        class="form-control form-control-sm"
                                        value={values[prompt.id]?.[name] ?? ""}
                                        oninput={(e) => setValue(prompt.id, name, e.currentTarget.value)}
                                    />
                                </div>
                            {/each}
                        </div>
                    {/if}
                    <pre class="bg-body-tertiary border rounded p-2 mb-2" style="white-space: pre-wrap; word-break: break-word;">{filled(prompt)}</pre>
                    <button class="btn btn-sm btn-primary" type="button" onclick={() => copy(prompt)}>
                        <i class="bi {copiedId === prompt.id ? 'bi-check2' : 'bi-clipboard'} me-1"></i>{copiedId === prompt.id ? "Copied" : "Copy prompt"}
                    </button>
                </div>
            {/if}
        </div>
    {:else}
        <div class="card p-3 text-body-secondary">No prompts match your search.</div>
    {/each}
</div>
