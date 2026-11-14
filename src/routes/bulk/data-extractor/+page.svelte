<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { EXTRACTORS, extractData } from "#lib/bulk.js";

    let kind = $state("emails");
    let unique = $state(true);
    let sort = $state(false);
</script>

<ConvertPage
    title="Data Extractor"
    description="Pull emails, URLs, domains, IP addresses, UUIDs, hashtags, colors, numbers or phone numbers out of any pile of text."
    label="Text"
    placeholder="Paste logs, web pages, documents or chat exports here"
    rows={14}
    convert={(text) => {
        const items = extractData(text, kind, { unique, sort });
        if (!items.length) throw new Error("Nothing of that type was found.");
        return items.join("\n");
    }}
    outputTitle="Extracted"
    filename="extracted.txt"
>
    {#snippet extra()}
        <div class="d-flex gap-3 flex-wrap align-items-end mb-3">
            <div>
                <label for="kind" class="form-label">Extract</label>
                <select id="kind" class="form-select" bind:value={kind}>
                    {#each Object.entries(EXTRACTORS) as [id, spec] (id)}<option value={id}>{spec.label}</option>{/each}
                </select>
            </div>
            <div class="form-check mb-2"><input id="unique" class="form-check-input" type="checkbox" bind:checked={unique} /><label class="form-check-label" for="unique">Unique only</label></div>
            <div class="form-check mb-2"><input id="sort" class="form-check-input" type="checkbox" bind:checked={sort} /><label class="form-check-label" for="sort">Sort</label></div>
        </div>
    {/snippet}
</ConvertPage>
