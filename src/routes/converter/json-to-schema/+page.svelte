<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { jsonToSchema } from "#lib/backlog.js";

    let required = $state(true);
    let formats = $state(true);
</script>

<ConvertPage
    title="JSON Schema Generator"
    description="Paste a sample JSON document and get a JSON Schema (draft 2020-12) that describes it. Review the result: a sample cannot tell which keys are really optional."
    label="Sample JSON"
    placeholder={'{"id": 1, "email": "ann@example.com", "tags": ["a", "b"]}'}
    rows={10}
    convert={(text) => jsonToSchema(text, { required, formats })}
    outputTitle="JSON Schema"
    filename="schema.json"
    mime="application/json"
>
    {#snippet extra()}
        <div class="mb-3 d-flex flex-wrap gap-4">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="schema-required" bind:checked={required} />
                <label class="form-check-label" for="schema-required">Mark every key as required</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="schema-formats" bind:checked={formats} />
                <label class="form-check-label" for="schema-formats">Detect formats (date, email, uri, uuid)</label>
            </div>
        </div>
    {/snippet}
</ConvertPage>
