<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { formatSql, SQL_DIALECTS } from "#lib/formatters.js";

    let language = $state("sql");
    let tabWidth = $state(2);
    let keywordCase = $state("upper");
</script>

<ConvertPage
    title="SQL Formatter"
    description="Prettify SQL queries for several dialects."
    label="SQL"
    placeholder="select id,name from users where active=1 order by name"
    convert={(text) => formatSql(text, { language, tabWidth: Number(tabWidth), keywordCase })}
    outputTitle="Formatted SQL"
    filename="query.sql"
    mime="application/sql"
>
    {#snippet extra()}
        <div class="d-flex gap-3 flex-wrap mb-3">
            <div>
                <label for="dialect" class="form-label">Dialect</label>
                <select id="dialect" class="form-select" bind:value={language}>
                    {#each SQL_DIALECTS as dialect (dialect)}
                        <option>{dialect}</option>
                    {/each}
                </select>
            </div>
            <div>
                <label for="tab" class="form-label">Indent</label>
                <select id="tab" class="form-select" bind:value={tabWidth}>
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                </select>
            </div>
            <div>
                <label for="case" class="form-label">Keywords</label>
                <select id="case" class="form-select" bind:value={keywordCase}>
                    <option value="upper">UPPER</option>
                    <option value="lower">lower</option>
                    <option value="preserve">Preserve</option>
                </select>
            </div>
        </div>
    {/snippet}
</ConvertPage>
