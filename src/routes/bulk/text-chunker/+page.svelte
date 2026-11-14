<script>
    import { chunkText } from "#lib/bulk.js";
    import { estimateTokens } from "#lib/vibe.js";
    import { copyToClipboard } from "#lib/textUtils.js";
    import { downloadZip, textBytes } from "#lib/zip.js";

    let text = $state("");
    let maxTokens = $state(1000);
    let overlapTokens = $state(0);
    let copiedIndex = $state(-1);

    const result = $derived.by(() => {
        try {
            return { chunks: chunkText(text, { maxTokens: Number(maxTokens), overlapTokens: Number(overlapTokens) }), error: "" };
        } catch (e) {
            return { chunks: [], error: e.message };
        }
    });

    const total = $derived(estimateTokens(text).tokens);

    const copy = async (chunk) => {
        if (await copyToClipboard(chunk.content)) {
            copiedIndex = chunk.index;
            setTimeout(() => (copiedIndex = -1), 1200);
        }
    };
</script>

<svelte:head>
    <title>Text Chunker | Mools</title>
</svelte:head>

<h1>Text Chunker</h1>
<p class="text-body-secondary mb-3">Split a long document into pieces that fit an AI model's context window. Chunks break on paragraphs and sentences, with optional overlap so context carries over. Token counts are estimates.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="text" class="form-label">Text ({total.toLocaleString()} tokens)</label>
                <textarea id="text" class="form-control" rows="12" bind:value={text} placeholder="Paste a long document, transcript or codebase notes"></textarea>
            </div>
            <div class="row g-2">
                <div class="col-6">
                    <label for="max" class="form-label small mb-0">Max tokens per chunk</label>
                    <input id="max" class="form-control" type="number" min="10" step="100" bind:value={maxTokens} />
                </div>
                <div class="col-6">
                    <label for="overlap" class="form-label small mb-0">Overlap (tokens)</label>
                    <input id="overlap" class="form-control" type="number" min="0" step="10" bind:value={overlapTokens} />
                </div>
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {:else if result.chunks.length}
            <div class="d-flex align-items-center mb-2">
                <h2 class="h5 mb-0 me-auto">{result.chunks.length} chunk{result.chunks.length === 1 ? "" : "s"}</h2>
                <button class="btn btn-success btn-sm" type="button" onclick={() => downloadZip(result.chunks.map((c) => ({ name: `chunk-${String(c.index).padStart(3, "0")}.txt`, data: textBytes(c.content) })), "chunks.zip")}><i class="bi bi-file-earmark-zip me-1"></i>Download ZIP</button>
            </div>
            <div class="d-flex flex-column gap-2">
                {#each result.chunks.slice(0, 100) as chunk (chunk.index)}
                    <div class="card p-2">
                        <div class="d-flex align-items-center mb-1">
                            <strong class="me-auto">Chunk {chunk.index}</strong>
                            <span class="badge bg-body-secondary text-body-secondary fw-normal me-2">~{chunk.tokens} tokens</span>
                            <button class="btn btn-sm btn-outline-secondary" type="button" aria-label="Copy chunk {chunk.index}" onclick={() => copy(chunk)}><i class="bi {copiedIndex === chunk.index ? 'bi-check2' : 'bi-clipboard'}"></i></button>
                        </div>
                        <pre class="bg-body-tertiary border rounded p-2 mb-0 small chunk">{chunk.content}</pre>
                    </div>
                {/each}
            </div>
            {#if result.chunks.length > 100}<p class="small text-body-secondary mt-2">Showing 100 of {result.chunks.length}. The ZIP has all of them.</p>{/if}
        {:else}
            <div class="card p-3 text-body-secondary">Chunks appear here.</div>
        {/if}
    </div>
</div>

<style>
    .chunk {
        max-height: 10rem;
        overflow: auto;
        white-space: pre-wrap;
        word-break: break-word;
    }
</style>
