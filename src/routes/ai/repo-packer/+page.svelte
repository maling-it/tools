<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { estimateTokens, packFiles, shouldIgnorePath } from "#lib/vibe.js";
    import { formatBytes } from "#lib/image.js";

    const MAX_FILE_BYTES = 500_000;
    const MAX_FILES = 500;

    let files = $state([]);
    let skipped = $state([]);
    let format = $state("markdown");
    let includeTree = $state(true);
    let busy = $state(false);

    const load = async (list) => {
        busy = true;
        const accepted = [];
        const rejected = [];
        for (const file of [...list].slice(0, 5000)) {
            const path = file.webkitRelativePath || file.name;
            if (shouldIgnorePath(path)) {
                rejected.push(`${path} (ignored)`);
            } else if (file.size > MAX_FILE_BYTES) {
                rejected.push(`${path} (over ${formatBytes(MAX_FILE_BYTES)})`);
            } else if (accepted.length >= MAX_FILES) {
                rejected.push(`${path} (more than ${MAX_FILES} files)`);
            } else {
                const content = await file.text();
                if (content.includes("\u0000")) rejected.push(`${path} (binary)`);
                else accepted.push({ path, content });
            }
        }
        files = accepted;
        skipped = rejected;
        busy = false;
    };

    const onPick = (event) => {
        load(event.currentTarget.files);
        event.currentTarget.value = "";
    };

    const packed = $derived(files.length ? packFiles(files, { format, includeTree }) : "");
    const stats = $derived(estimateTokens(packed));
</script>

<svelte:head>
    <title>Repo Packer | Mools</title>
</svelte:head>

<h1>Repo Packer</h1>
<p class="text-body-secondary mb-3">
    Combine a folder of code into one document you can paste into an AI chat. Lock files, build output, binaries and <code>node_modules</code> are skipped. Files are read in your browser and never uploaded.
</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="folder" class="form-label">Choose a folder</label>
                <input id="folder" class="form-control" type="file" webkitdirectory multiple disabled={busy} onchange={onPick} />
            </div>
            <div class="mb-3">
                <label for="files" class="form-label">Or choose files</label>
                <input id="files" class="form-control" type="file" multiple disabled={busy} onchange={onPick} />
            </div>
            <div class="d-flex gap-3 flex-wrap align-items-end">
                <div>
                    <label for="format" class="form-label">Format</label>
                    <select id="format" class="form-select" bind:value={format}>
                        <option value="markdown">Markdown</option>
                        <option value="xml">XML</option>
                    </select>
                </div>
                <div class="form-check mb-2">
                    <input id="tree" class="form-check-input" type="checkbox" bind:checked={includeTree} />
                    <label class="form-check-label" for="tree">Directory tree</label>
                </div>
            </div>
            {#if busy}<p class="text-body-secondary mt-3 mb-0">Reading files...</p>{/if}
            {#if files.length}
                <p class="mt-3 mb-0">{files.length} files packed, about <strong>{stats.tokens.toLocaleString()}</strong> tokens ({formatBytes(packed.length)}).</p>
            {/if}
            {#if skipped.length}
                <details class="mt-3">
                    <summary class="small text-body-secondary">{skipped.length} files skipped</summary>
                    <ul class="small mt-2 mb-0">
                        {#each skipped.slice(0, 50) as item (item)}<li class="text-break">{item}</li>{/each}
                        {#if skipped.length > 50}<li>and {skipped.length - 50} more</li>{/if}
                    </ul>
                </details>
            {/if}
        </div>
    </div>
    <div class="col-lg-7">
        <OutputCard title="Packed context" text={packed} filename={format === "xml" ? "context.xml" : "context.md"} mime="text/plain" />
        <p class="small text-body-secondary mt-2">Review the output before sharing it: remove anything private such as API keys or <code>.env</code> files.</p>
    </div>
</div>
