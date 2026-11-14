<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { escapeHtml, unescapeHtml } from "#lib/textUtils.js";

    let text = $state("");

    const actions = [
        { label: "Escape", transform: escapeHtml },
        { label: "Unescape", transform: unescapeHtml }
    ];
</script>

<ToolPage
    title="HTML Escape/Unescape Tool"
    description="Escape or unescape HTML entities in your text."
    bind:value={text}
    label="HTML Content"
    placeholder="Enter your HTML here"
    {actions}
/>
