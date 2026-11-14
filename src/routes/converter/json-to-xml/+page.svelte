<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { jsonToXml } from "#lib/formats.js";

    let root = $state("root");
</script>

<ConvertPage
    title="JSON to XML"
    description="Convert JSON into XML. Keys starting with @ become attributes, #text becomes text content, arrays repeat the element."
    label="JSON"
    placeholder={'{"note": {"@id": "1", "to": "Jane"}}'}
    convert={(text) => jsonToXml(text, { root: root.trim() || "root" })}
    outputTitle="XML Output"
    filename="data.xml"
    mime="application/xml"
>
    {#snippet extra()}
        <div class="mb-3">
            <label for="root" class="form-label">Root element (used when the JSON has no single top-level key)</label>
            <input id="root" class="form-control w-auto" bind:value={root} />
        </div>
    {/snippet}
</ConvertPage>
