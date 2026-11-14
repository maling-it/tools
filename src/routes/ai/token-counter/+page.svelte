<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import StatRows from "../../../components/StatRows.svelte";
    import { estimateCost, estimateTokens } from "#lib/vibe.js";

    let text = $state("");
    let price = $state(3);

    const stats = $derived(estimateTokens(text));
</script>

<ToolPage
    title="LLM Token Counter"
    description="Estimate how many tokens a prompt or file will use. This is an approximation (about 4 characters per token for English); exact counts depend on the model."
    bind:value={text}
    label="Text or code"
    placeholder="Paste a prompt, a file or a whole conversation"
    rows={12}
>
    {#snippet output()}
        <div class="d-flex flex-column gap-3">
            <StatRows
                title="Estimate"
                rows={[
                    ["Tokens (approx.)", stats.tokens.toLocaleString()],
                    ["Characters", stats.characters.toLocaleString()],
                    ["Words", stats.words.toLocaleString()],
                    ["Lines", stats.lines.toLocaleString()],
                    ["Cost as input", `$${estimateCost(stats.tokens, price).toFixed(4)}`]
                ]}
            />
            <div class="card p-3">
                <label for="price" class="form-label">Price per 1M input tokens ($)</label>
                <input id="price" class="form-control w-auto" type="number" min="0" step="any" bind:value={price} />
                <div class="form-text">Check your provider's pricing page and enter the current rate.</div>
            </div>
        </div>
    {/snippet}
</ToolPage>
