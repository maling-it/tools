<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { jsonToCsv } from "#lib/converters.js";

    let delimiter = $state(",");
</script>

<ConvertPage
    title="JSON to CSV Converter"
    description="Convert a JSON array of objects into CSV. Columns are the union of all keys."
    label="JSON"
    placeholder={'[{"name": "Jane", "age": 30}]'}
    convert={(text) => jsonToCsv(text, { delimiter })}
    outputTitle="CSV Output"
    filename="data.csv"
    mime="text/csv"
>
    {#snippet extra()}
        <div class="mb-3">
            <label for="delimiter" class="form-label">Delimiter</label>
            <select id="delimiter" class="form-select w-auto" bind:value={delimiter}>
                <option value=",">Comma</option>
                <option value=";">Semicolon</option>
                <option value={"\t"}>Tab</option>
                <option value="|">Pipe</option>
            </select>
        </div>
    {/snippet}
</ConvertPage>
