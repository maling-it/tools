<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { LINE_OPERATIONS, runBulk } from "#lib/bulk.js";

    let text = $state("");
    let operation = $state("urlEncode");
    let options = $state({ prefix: "", suffix: "", find: "", replacement: "", regex: false, caseSensitive: true });
    let rows = $state([]);

    const groups = [...new Set(LINE_OPERATIONS.map((op) => op.group))];

    $effect(() => {
        const [input, op, opts] = [text, operation, { ...options }];
        let cancelled = false;
        if (!input) {
            rows = [];
            return;
        }
        runBulk(input, op, opts).then((result) => {
            if (!cancelled) rows = result;
        });
        return () => (cancelled = true);
    });

    const outputs = $derived(rows.map((r) => r.output).join("\n"));
    const failed = $derived(rows.filter((r) => r.error).length);
</script>

<svelte:head>
    <title>Bulk Text Transformer | Mools</title>
</svelte:head>

<h1>Bulk Text Transformer</h1>
<p class="text-body-secondary mb-3">Apply one operation to every line of a list: encode, decode, change case, slugify, hash, clean URLs and more. A bad line is reported without stopping the rest.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="operation" class="form-label">Operation</label>
                <select id="operation" class="form-select" bind:value={operation}>
                    {#each groups as group (group)}
                        <optgroup label={group}>
                            {#each LINE_OPERATIONS.filter((op) => op.group === group) as op (op.id)}
                                <option value={op.id}>{op.label}</option>
                            {/each}
                        </optgroup>
                    {/each}
                </select>
            </div>
            {#if operation === "affix"}
                <div class="row g-2 mb-3">
                    <div class="col-6"><label for="prefix" class="form-label small mb-0">Prefix</label><input id="prefix" class="form-control" bind:value={options.prefix} /></div>
                    <div class="col-6"><label for="suffix" class="form-label small mb-0">Suffix</label><input id="suffix" class="form-control" bind:value={options.suffix} /></div>
                </div>
            {:else if operation === "replace"}
                <div class="row g-2 mb-2">
                    <div class="col-6"><label for="find" class="form-label small mb-0">Find</label><input id="find" class="form-control" bind:value={options.find} /></div>
                    <div class="col-6"><label for="replacement" class="form-label small mb-0">Replace with</label><input id="replacement" class="form-control" bind:value={options.replacement} /></div>
                </div>
                <div class="d-flex gap-3 mb-3">
                    <div class="form-check"><input id="regex" class="form-check-input" type="checkbox" bind:checked={options.regex} /><label class="form-check-label" for="regex">Regex</label></div>
                    <div class="form-check"><input id="case" class="form-check-input" type="checkbox" bind:checked={options.caseSensitive} /><label class="form-check-label" for="case">Case sensitive</label></div>
                </div>
            {/if}
            <div>
                <label for="input" class="form-label">Lines (one item per line)</label>
                <textarea id="input" class="form-control font-monospace" rows="14" spellcheck="false" placeholder={"first item\nsecond item\nthird item"} bind:value={text}></textarea>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        <OutputCard title="Result ({rows.length} lines{failed ? `, ${failed} failed` : ''})" text={outputs} filename="result.txt" />
        {#if failed}
            <div class="alert alert-warning mt-3 mb-0" role="status">
                <strong>{failed} line{failed === 1 ? "" : "s"} could not be processed:</strong>
                <ul class="mb-0 small">
                    {#each rows.filter((r) => r.error).slice(0, 8) as row, i (i)}
                        <li><code class="text-break">{row.input.slice(0, 60)}</code>: {row.error}</li>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>
</div>
