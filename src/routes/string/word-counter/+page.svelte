<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { textStats } from "../../../lib/textUtils.js";

    let text = '';
    let stats = textStats('');

    const handleInput = () => {
        stats = textStats(text);
    };

    $: outputs = [{
        title: "Text Statistics",
        type: "stats",
        stats: [
            { label: "Words", value: stats.totalWords },
            { label: "Unique words", value: stats.uniqueWords },
            { label: "Lines", value: stats.totalLines },
            { label: "Characters", value: stats.totalCharacters },
            { label: "Characters (no spaces)", value: stats.totalCharactersNoSpaces }
        ]
    }];
</script>

<ToolPage
    title="Text Statistics Tool"
    description="Get detailed statistics about your text including word count, character count, and more."
    bind:textValue={text}
    textPlaceholder="Enter your text here"
    textLabel="Text"
    buttons={[]}
    {outputs}
    on:input={handleInput}
/>