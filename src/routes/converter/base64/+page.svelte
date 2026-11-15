<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { base64Encode, base64Decode } from "#lib/converters.js";

    let text = $state("");
    let urlSafe = $state(false);

    const actions = $derived([
        { label: "Encode", transform: (value) => base64Encode(value, { urlSafe }) },
        { label: "Decode", transform: base64Decode }
    ]);
</script>

<ToolPage
    title="Base64 Encode/Decode"
    description="Encode text to Base64 or decode it back. Unicode text is handled as UTF-8."
    bind:value={text}
    {actions}
>
    {#snippet extra()}
        <div class="form-check mb-3">
            <input id="url-safe" class="form-check-input" type="checkbox" bind:checked={urlSafe} />
            <label class="form-check-label" for="url-safe">URL-safe alphabet (no padding) when encoding</label>
        </div>
    {/snippet}
</ToolPage>
