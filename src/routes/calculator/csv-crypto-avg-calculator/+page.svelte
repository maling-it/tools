<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import StatRows from "../../../components/StatRows.svelte";
    import { averageCost, parseTradeLines } from "#lib/calculators.js";

    let text = $state("");

    const result = $derived.by(() => {
        if (text.trim() === "") return { data: null, error: "" };
        try {
            const entries = parseTradeLines(text);
            return { data: { ...averageCost(entries), count: entries.length }, error: "" };
        } catch (e) {
            return { data: null, error: e.message };
        }
    });

    const fmt = (n, digits = 2) => n.toLocaleString(undefined, { maximumFractionDigits: digits });
</script>

<ToolPage
    title="CSV Crypto Average Calculator"
    description="Paste many purchases, one per line as amount,price, and get your average buy price."
    bind:value={text}
    label="Purchases (amount,price)"
    placeholder={"amount,price\n1,30000\n0.5,20000"}
    error={result.error}
>
    {#snippet output()}
        {#if result.data}
            <StatRows
                rows={[
                    ["Purchases", result.data.count],
                    ["Total amount", fmt(result.data.totalAmount, 8)],
                    ["Total cost", fmt(result.data.totalCost)],
                    ["Average price", fmt(result.data.average, 8)]
                ]}
            />
        {:else}
            <div class="card p-3 text-body-secondary">Results appear here.</div>
        {/if}
    {/snippet}
</ToolPage>
