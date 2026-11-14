<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import OutputCard from "../../../components/OutputCard.svelte";
    import { toVanOphuijsen } from "#lib/converters.js";

    let text = $state("");
    const converted = $derived(toVanOphuijsen(text));
</script>

<ToolPage
    title="Indonesian Spelling Converter"
    description="Convert modern Indonesian spelling into the Van Ophuijsen spelling, e.g. j to dj, y to j, u to oe."
    bind:value={text}
    label="Regular Indonesian Sentence"
    placeholder="Enter a sentence"
>
    {#snippet output()}
        <OutputCard title="Converted Spelling" text={converted} />
    {/snippet}
</ToolPage>
