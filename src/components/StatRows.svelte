<script>
    import { copyToClipboard } from "#lib/textUtils.js";

    // rows: [label, value] pairs. With `copyable`, each value gets a copy button.
    let { rows = [], title = "Results", copyable = false } = $props();

    let copied = $state("");

    const copy = async (name, value) => {
        if (await copyToClipboard(String(value))) {
            copied = name;
            setTimeout(() => (copied = ""), 1200);
        }
    };
</script>

<div class="card p-3">
    {#if title}<h2 class="h5 card-title">{title}</h2>{/if}
    <table class="table table-sm mb-0 align-middle">
        <tbody>
            {#each rows as [name, value] (name)}
                <tr>
                    <th scope="row" class="fw-normal">{name}</th>
                    <td class="text-end fw-semibold text-break">{value}</td>
                    {#if copyable}
                        <td class="text-end" style="width: 2.5rem;">
                            <button class="btn btn-sm btn-outline-secondary" type="button" aria-label="Copy {name}" onclick={() => copy(name, value)}>
                                <i class="bi {copied === name ? 'bi-check2' : 'bi-clipboard'}"></i>
                            </button>
                        </td>
                    {/if}
                </tr>
            {/each}
        </tbody>
    </table>
</div>
