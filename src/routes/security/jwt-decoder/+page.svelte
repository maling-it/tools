<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import OutputCard from "../../../components/OutputCard.svelte";
    import StatRows from "../../../components/StatRows.svelte";
    import { decodeJwt } from "#lib/netSecurity.js";

    let token = $state("");

    const result = $derived.by(() => {
        if (!token.trim()) return { jwt: null, error: "" };
        try {
            return { jwt: decodeJwt(token), error: "" };
        } catch (e) {
            return { jwt: null, error: e.message };
        }
    });
</script>

<ToolPage
    title="JWT Decoder"
    description="Decode a JSON Web Token in your browser. The token is never sent anywhere, and the signature is not verified."
    bind:value={token}
    label="JWT"
    placeholder="eyJhbGciOi..."
    rows={8}
    error={result.error}
>
    {#snippet output()}
        {#if result.jwt}
            <div class="d-flex flex-column gap-3">
                <StatRows
                    title="Claims"
                    rows={[
                        ["Algorithm", result.jwt.header.alg ?? "none"],
                        ["Issued at", result.jwt.issuedAt ?? "-"],
                        ["Not before", result.jwt.notBefore ?? "-"],
                        ["Expires", result.jwt.expiresAt ? `${result.jwt.expiresAt} (${result.jwt.expired ? "expired" : "valid"})` : "-"]
                    ]}
                />
                <OutputCard title="Header" text={JSON.stringify(result.jwt.header, null, 2)} />
                <OutputCard title="Payload" text={JSON.stringify(result.jwt.payload, null, 2)} />
            </div>
        {:else}
            <div class="card p-3 text-body-secondary">The decoded token appears here.</div>
        {/if}
    {/snippet}
</ToolPage>
