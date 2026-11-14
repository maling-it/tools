<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { extractLinks } from "#lib/htmlTools.js";

    let format = $state("urls");

    const convert = (html) => {
        const links = extractLinks(html);
        if (links.length === 0) throw new Error("No links found.");
        return format === "urls" ? links.map((link) => link.href).join("\n") : JSON.stringify(links, null, 2);
    };
</script>

<ConvertPage
    title="HTML Link Extractor"
    description="Extract every link from a piece of HTML."
    label="HTML"
    placeholder={'<a href="https://example.com">Example</a>'}
    {convert}
    outputTitle="Links"
    filename="links.txt"
>
    {#snippet extra()}
        <div class="mb-3">
            <label for="format" class="form-label">Output</label>
            <select id="format" class="form-select w-auto" bind:value={format}>
                <option value="urls">URLs only</option>
                <option value="json">JSON with link text</option>
            </select>
        </div>
    {/snippet}
</ConvertPage>
