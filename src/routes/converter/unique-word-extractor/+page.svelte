<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { uniqueWords } from "#lib/converters.js";

    let sort = $state(false);
</script>

<ConvertPage
    title="Unique Word Extractor"
    description="List every distinct word in your text, case-insensitively."
    label="Text"
    placeholder="Paste your text here"
    convert={(text) => uniqueWords(text, { sort })}
    outputTitle="Unique Words"
    filename="words.txt"
>
    {#snippet extra()}
        <div class="form-check mb-3">
            <input id="sort" class="form-check-input" type="checkbox" bind:checked={sort} />
            <label class="form-check-label" for="sort">Sort alphabetically</label>
        </div>
    {/snippet}
</ConvertPage>
