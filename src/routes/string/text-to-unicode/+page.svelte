<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { textToUnicode, unicodeToText } from "#lib/devUtils.js";

    let text = $state("");
    const actions = [
        { label: "Text to Unicode", transform: textToUnicode },
        { label: "Unicode to Text", transform: unicodeToText }
    ];
</script>

<ToolPage
    title="Text to Unicode"
    description={"Convert text to Unicode code points (U+0048) and back. Also decodes \\u0048, \\u{1F600} and &#x48; escapes."}
    bind:value={text}
    placeholder="Hello 😀 or U+0048 U+0069"
    {actions}
/>
