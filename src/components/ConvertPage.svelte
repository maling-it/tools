<script>
    import ToolPage from "./ToolPage.svelte";
    import OutputCard from "./OutputCard.svelte";

    /**
     * Input textarea with a live converted output. `convert(text)` may throw; its message is
     * shown as the error. It is not called for empty input (some converters need the DOM).
     */
    let {
        title,
        description = "",
        label = "Input",
        placeholder = "",
        convert,
        extra,
        outputTitle = "Output",
        filename = "",
        mime = "text/plain",
        rows = 10
    } = $props();

    let value = $state("");

    const result = $derived.by(() => {
        if (value.trim() === "") return { text: "", error: "" };
        try {
            return { text: convert(value), error: "" };
        } catch (e) {
            return { text: "", error: e.message };
        }
    });
</script>

<ToolPage {title} {description} {label} {placeholder} {rows} {extra} bind:value error={result.error}>
    {#snippet output()}
        <OutputCard title={outputTitle} text={result.text} {filename} {mime} />
    {/snippet}
</ToolPage>
