<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { escapeXml, unescapeXml } from "#lib/textUtils.js";

    let text = $state("");

    const actions = [
        { label: "Escape", transform: escapeXml },
        { label: "Unescape", transform: unescapeXml }
    ];
</script>

<ToolPage
    title="XML Escape/Unescape Tool"
    description="Escape or unescape XML special characters in your text."
    bind:value={text}
    label="XML Content"
    placeholder="Enter your XML here"
    {actions}
/>
