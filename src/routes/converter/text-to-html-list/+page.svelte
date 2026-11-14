<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { textToHtmlList } from "#lib/converters.js";

    let ordered = $state(false);
</script>

<ConvertPage
    title="Text to HTML List"
    description="Turn each line of text into an item of an HTML list."
    label="Text (one item per line)"
    placeholder="Apples&#10;Oranges&#10;Pears"
    convert={(text) => textToHtmlList(text, { ordered })}
    outputTitle="HTML List"
    filename="list.html"
    mime="text/html"
>
    {#snippet extra()}
        <div class="form-check mb-3">
            <input id="ordered" class="form-check-input" type="checkbox" bind:checked={ordered} />
            <label class="form-check-label" for="ordered">Numbered list</label>
        </div>
    {/snippet}
</ConvertPage>
