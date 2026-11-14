<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { propertiesToJson } from "#lib/converters.js";
</script>

<ConvertPage
    title="Properties to JSON"
    description="Convert a Java .properties file into nested JSON. Dotted keys become objects, [0] becomes arrays."
    label="Properties"
    placeholder="app.name=mools&#10;app.tags[0]=tools"
    convert={(text) => propertiesToJson(text)}
    outputTitle="JSON Output"
    filename="data.json"
    mime="application/json"
/>
