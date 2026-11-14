<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { escapeJs, unescapeJs } from "#lib/textUtils.js";

    let text = $state("");

    const actions = [
        { label: "Escape", transform: escapeJs },
        { label: "Unescape", transform: unescapeJs }
    ];
</script>

<ToolPage
    title="JavaScript Escape/Unescape Tool"
    description="Escape a string for safe use inside a JavaScript string literal, or decode escape sequences such as \n, \xHH and \uHHHH."
    bind:value={text}
    label="JavaScript String"
    placeholder="Enter your JavaScript here"
    {actions}
/>
