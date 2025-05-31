<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { escapeHtml, unescapeHtml } from "../../../lib/textUtils.js";

    let text = "";

    const buttons = [
        {
            label: "Escape",
            onClick: () => { text = escapeHtml(text); }
        },
        {
            label: "Unescape", 
            onClick: () => { text = unescapeHtml(text); }
        }
    ];
</script>

<ToolPage
    title="HTML Escape/Unescape Tool"
    description="Escape or unescape HTML entities in your text."
    bind:textValue={text}
    textPlaceholder="Enter your HTML here"
    textLabel="HTML Content"
    {buttons}
/>
