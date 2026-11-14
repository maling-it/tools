<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import OutputCard from "../../../components/OutputCard.svelte";
    import { csvToJson } from "#lib/converters.js";

    let csv = $state("");
    let delimiter = $state(",");
    let header = $state(true);

    const result = $derived.by(() => {
        if (csv.trim() === "") return { json: "", error: "" };
        try {
            return { json: JSON.stringify(csvToJson(csv, { delimiter, header }), null, 2), error: "" };
        } catch (e) {
            return { json: "", error: `Could not parse CSV: ${e.message}.` };
        }
    });
</script>

<ToolPage
    title="CSV to JSON Converter"
    description="Convert CSV data into JSON. Quoted fields, escaped quotes and multi-line values are supported."
    bind:value={csv}
    label="CSV Data"
    placeholder="name,age&#10;Jane,30"
    rows={10}
    error={result.error}
>
    {#snippet extra()}
        <div class="d-flex gap-3 flex-wrap align-items-end mb-3">
            <div>
                <label for="delimiter" class="form-label">Delimiter</label>
                <select id="delimiter" class="form-select" bind:value={delimiter}>
                    <option value=",">Comma</option>
                    <option value=";">Semicolon</option>
                    <option value={"\t"}>Tab</option>
                    <option value="|">Pipe</option>
                </select>
            </div>
            <div class="form-check mb-2">
                <input id="header-check" class="form-check-input" type="checkbox" bind:checked={header} />
                <label class="form-check-label" for="header-check">First row is header</label>
            </div>
        </div>
    {/snippet}
    {#snippet output()}
        <OutputCard title="JSON Output" text={result.json} filename="data.json" mime="application/json" />
    {/snippet}
</ToolPage>
