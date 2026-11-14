<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { yamlToJson } from "#lib/formats.js";
</script>

<ConvertPage
    title="YAML to JSON"
    description="Convert YAML into formatted JSON."
    label="YAML"
    placeholder={"name: mools\ntags:\n  - tools"}
    convert={(text) => yamlToJson(text)}
    outputTitle="JSON Output"
    filename="data.json"
    mime="application/json"
/>
