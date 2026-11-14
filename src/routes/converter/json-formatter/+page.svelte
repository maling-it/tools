<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { formatJson, minifyJson } from "#lib/converters.js";

    let text = $state("");
    let indent = $state("2");

    const actions = $derived([
        { label: "Prettify", transform: (value) => formatJson(value, indent === "tab" ? "\t" : Number(indent)) },
        { label: "Minify", transform: minifyJson, variant: "btn-outline-primary" }
    ]);
</script>

<ToolPage
    title="JSON Formatter"
    description="Validate, prettify or minify JSON. Errors show where parsing failed."
    bind:value={text}
    label="JSON"
    placeholder={'{"hello": "world"}'}
    rows={14}
    {actions}
>
    {#snippet extra()}
        <div class="mb-3">
            <label for="indent" class="form-label">Indentation</label>
            <select id="indent" class="form-select w-auto" bind:value={indent}>
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="tab">Tab</option>
            </select>
        </div>
    {/snippet}
</ToolPage>
