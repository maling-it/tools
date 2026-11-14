<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { slugify } from "#lib/devUtils.js";

    let separator = $state("-");
</script>

<ConvertPage
    title="Slugify String"
    description="Turn any text into a URL-friendly slug. Accents are removed and symbols become separators."
    label="Text"
    placeholder="Héllo Wörld, this is a title!"
    rows={4}
    convert={(text) => text.split(/\r?\n/).map((line) => slugify(line, { separator })).join("\n")}
    outputTitle="Slug"
>
    {#snippet extra()}
        <div class="mb-3">
            <label for="separator" class="form-label">Separator</label>
            <select id="separator" class="form-select w-auto" bind:value={separator}>
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value=".">Dot (.)</option>
            </select>
        </div>
    {/snippet}
</ConvertPage>
