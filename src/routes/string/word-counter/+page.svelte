<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { textStats } from "#lib/textUtils.js";

    let text = $state("");

    const stats = $derived(textStats(text));
    const rows = $derived([
        ["Words", stats.totalWords],
        ["Unique words", stats.uniqueWords],
        ["Sentences", stats.totalSentences],
        ["Paragraphs", stats.totalParagraphs],
        ["Lines", stats.totalLines],
        ["Characters", stats.totalCharacters],
        ["Characters (no spaces)", stats.totalCharactersNoSpaces],
        ["Reading time", `${stats.readingMinutes} min`]
    ]);
</script>

<ToolPage
    title="Text Statistics Tool"
    description="Get detailed statistics about your text, updated as you type."
    bind:value={text}
>
    {#snippet output()}
        <div class="card p-3">
            <h2 class="h5 card-title">Text Statistics</h2>
            <table class="table table-sm mb-0">
                <tbody>
                    {#each rows as [name, count] (name)}
                        <tr>
                            <th scope="row" class="fw-normal">{name}</th>
                            <td class="text-end fw-semibold">{count}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/snippet}
</ToolPage>
