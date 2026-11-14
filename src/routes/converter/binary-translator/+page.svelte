<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { textToBinary, binaryToText } from "#lib/converters.js";

    let text = $state("");
    const actions = [
        { label: "Text to Binary", transform: textToBinary },
        { label: "Binary to Text", transform: binaryToText }
    ];
</script>

<ToolPage
    title="Binary Translator"
    description="Translate text into 8-bit binary (UTF-8) and back."
    bind:value={text}
    placeholder="Hello or 01001000 01101001"
    {actions}
/>
