<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { urlEncode, urlDecode } from "#lib/textUtils.js";

    let text = $state("");

    const actions = [
        { label: "Encode", transform: urlEncode },
        {
            label: "Decode",
            transform: (value) => {
                try {
                    return urlDecode(value);
                } catch {
                    throw new Error("Malformed URL encoding, check for a stray % sign.");
                }
            }
        }
    ];
</script>

<ToolPage
    title="URL Encode/Decode Tool"
    description="Percent-encode text for use in a URL, or decode it back."
    bind:value={text}
    label="URL or Text"
    placeholder="Enter your URL here"
    {actions}
/>
