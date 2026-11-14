<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { htmlTablesToJson } from "#lib/htmlTools.js";
</script>

<ConvertPage
    title="HTML Table to JSON"
    description="Paste HTML containing a table and get its rows as JSON. Header cells become the keys."
    label="HTML"
    placeholder="<table>...</table>"
    convert={(html) => JSON.stringify(htmlTablesToJson(html), null, 2)}
    outputTitle="JSON Output"
    filename="table.json"
    mime="application/json"
/>
