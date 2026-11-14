<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { removeStopwords } from "#lib/converters.js";

    let text = $state("");
    const actions = [{ label: "Remove Stopwords", transform: removeStopwords }];
</script>

<ToolPage
    title="Remove Stopwords"
    description="Strip common English filler words such as the, is, and and of from your text."
    bind:value={text}
    {actions}
/>
