<script>
    import { copyToClipboard } from '#lib/textUtils.js';

    let { title = 'Output', text = '', filename = '', mime = 'text/plain' } = $props();

    let copied = $state(false);

    const copy = async () => {
        if (await copyToClipboard(text)) {
            copied = true;
            setTimeout(() => (copied = false), 1500);
        }
    };

    const download = () => {
        const url = URL.createObjectURL(new Blob([text], { type: mime }));
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };
</script>

<div class="card p-3">
    <h2 class="h5 card-title">{title}</h2>
    <pre class="bg-body-tertiary border rounded p-2 mb-2 output-text">{text}</pre>
    <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm" type="button" onclick={copy} disabled={!text}>
            <i class="bi {copied ? 'bi-check2' : 'bi-clipboard'} me-1"></i>
            {copied ? 'Copied' : 'Copy'}
        </button>
        {#if filename}
            <button class="btn btn-outline-secondary btn-sm" type="button" onclick={download} disabled={!text}>
                <i class="bi bi-download me-1"></i>
                Download
            </button>
        {/if}
    </div>
</div>

<style>
    .output-text {
        max-height: 24rem;
        min-height: 4rem;
        overflow: auto;
        white-space: pre-wrap;
        word-break: break-word;
    }
</style>
