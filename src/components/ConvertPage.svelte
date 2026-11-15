<script>
    import ToolPage from "./ToolPage.svelte";
    import OutputCard from "./OutputCard.svelte";
    import { announce } from "#lib/announce.svelte.js";

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

    // Let screen reader users know that the output changed, once typing pauses.
    $effect(() => {
        const output = result.text;
        const timer = setTimeout(() => {
            if (value.trim() === "") return;
            if (output === "") return; // errors are announced by their own alert
            announce(`Result updated, ${output.split("\n").length} ${output.split("\n").length === 1 ? "line" : "lines"}`);
        }, 900);
        return () => clearTimeout(timer);
    });
</script>

<ToolPage {title} {description} {label} {placeholder} {rows} {extra} bind:value error={result.error}>
    {#snippet output()}
        <OutputCard title={outputTitle} text={result.text} {filename} {mime} />
    {/snippet}
</ToolPage>
