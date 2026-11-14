<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { csvToHtmlTable } from "#lib/converters.js";

    let delimiter = $state(",");
    let header = $state(true);
</script>

<ConvertPage
    title="CSV to HTML Table"
    description="Turn CSV data into an HTML table you can paste into a page."
    label="CSV Data"
    placeholder="name,age&#10;Jane,30"
    convert={(text) => csvToHtmlTable(text, { delimiter, header })}
    outputTitle="HTML Table"
    filename="table.html"
    mime="text/html"
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
</ConvertPage>
