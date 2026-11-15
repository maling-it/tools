<script>
    import { copyToClipboard } from '#lib/textUtils.js';
    import { announce } from '#lib/announce.svelte.js';

    /**
     * Shared layout for text tools.
     *
     * `actions` are `{ label, transform, variant? }` buttons; `transform` receives the
     * current text and returns the new text (or a promise of it). Thrown errors are shown in an alert.
     * `extra` renders additional inputs above the textarea, `output` renders a result column.
     */
    let {
        title,
        description = '',
        value = $bindable(''),
        label = 'Text',
        placeholder = 'Enter your text here',
        rows = 8,
        actions = [],
        // A problem with the current input, worked out by the page (for example an invalid pattern in a live converter).
        error = '',
        extra,
        output
    } = $props();

    let copied = $state(false);

    // A problem reported by an action button; it is cleared when the text changes.
    let actionError = $state('');
    let busy = $state(false);

    const run = async (action) => {
        actionError = '';
        busy = true;
        try {
            value = await action.transform(value);
        } catch (e) {
            actionError = e.message;
        } finally {
            busy = false;
        }
    };

    const copy = async () => {
        if (await copyToClipboard(value)) {
            announce('Copied to clipboard');
            copied = true;
            setTimeout(() => (copied = false), 1500);
        }
    };

    const clear = () => {
        value = '';
        actionError = '';
    };
</script>

<svelte:head>
    <title>{title} | Mools</title>
</svelte:head>

<h1>{title}</h1>

{#if description}
    <p class="text-body-secondary mb-3">{description}</p>
{/if}

<div class="row g-3">
    <div class={output ? 'col-lg-6' : 'col-12'}>
        <div class="card p-3">
            {@render extra?.()}

            <div class="mb-3">
                <label for="main-textarea" class="form-label">{label}</label>
                <textarea
                    bind:value
                    class="form-control font-monospace"
                    id="main-textarea"
                    {rows}
                    {placeholder}
                    spellcheck="false"
                    oninput={() => (actionError = '')}
                ></textarea>
            </div>

            {#if actionError || error}
                <div class="alert alert-danger py-2" role="alert">{actionError || error}</div>
            {/if}

            <div class="d-flex gap-2 flex-wrap">
                {#each actions as action (action.label)}
                    <button
                        class="btn {action.variant ?? 'btn-primary'}"
                        type="button"
                        disabled={busy}
                        onclick={() => run(action)}
                    >
                        {action.label}
                    </button>
                {/each}
                <button class="btn btn-outline-secondary ms-auto" type="button" onclick={copy} disabled={!value}>
                    <i class="bi {copied ? 'bi-check2' : 'bi-clipboard'} me-1"></i>
                    {copied ? 'Copied' : 'Copy'}
                </button>
                <button class="btn btn-outline-secondary" type="button" onclick={clear} disabled={!value}>
                    Clear
                </button>
            </div>
        </div>
    </div>

    {#if output}
        <div class="col-lg-6">
            {@render output()}
        </div>
    {/if}
</div>
