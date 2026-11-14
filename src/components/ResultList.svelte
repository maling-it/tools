<script>
    import { copyToClipboard } from "#lib/textUtils.js";

    let { items = [], title = "Results" } = $props();

    let copiedIndex = $state(-1);

    const copy = async (text, index) => {
        if (await copyToClipboard(text)) {
            copiedIndex = index;
            setTimeout(() => (copiedIndex = -1), 1200);
        }
    };
</script>

<div class="card p-3">
    <h2 class="h5 card-title">{title}</h2>
    <ul class="list-group">
        {#each items as item, index (index)}
            <li class="list-group-item d-flex align-items-center gap-2">
                <span class="me-auto font-monospace text-break">{item}</span>
                <button class="btn btn-sm btn-outline-secondary flex-shrink-0" type="button" aria-label="Copy" onclick={() => copy(item, index)}>
                    <i class="bi {copiedIndex === index ? 'bi-check2' : 'bi-clipboard'}"></i>
                </button>
            </li>
        {:else}
            <li class="list-group-item text-body-secondary">Nothing generated yet.</li>
        {/each}
    </ul>
</div>
