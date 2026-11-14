<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import OutputCard from "../../../components/OutputCard.svelte";
    import { markdownToHtml } from "#lib/formatters.js";

    let markdown = $state("");

    const html = $derived(markdown.trim() ? markdownToHtml(markdown) : "");
    // The preview runs in a sandboxed iframe without scripts, so pasted Markdown cannot execute code.
    const preview = $derived(`<base target="_blank"><style>body{font-family:system-ui,sans-serif;margin:12px;color:#222}pre,code{background:#f3f3f3}pre{padding:8px;overflow:auto}img{max-width:100%}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:4px 8px}</style>${html}`);
</script>

<ToolPage
    title="Markdown to HTML"
    description="Convert Markdown (GitHub flavored) into HTML and preview the result."
    bind:value={markdown}
    label="Markdown"
    placeholder={"# Hello\n\nSome **bold** text and a [link](https://example.com)."}
    rows={14}
>
    {#snippet output()}
        <div class="d-flex flex-column gap-3">
            <OutputCard title="HTML" text={html} filename="document.html" mime="text/html" />
            {#if html}
                <div class="card p-3">
                    <h2 class="h5 card-title">Preview</h2>
                    <iframe title="Markdown preview" sandbox="allow-popups" srcdoc={preview} class="border rounded bg-white w-100" style="height: 20rem;"></iframe>
                </div>
            {/if}
        </div>
    {/snippet}
</ToolPage>
