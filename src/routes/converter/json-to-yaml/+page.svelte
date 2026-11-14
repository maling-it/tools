<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { jsonToYaml } from "#lib/formats.js";
</script>

<ConvertPage
    title="JSON to YAML"
    description="Convert JSON into readable YAML."
    label="JSON"
    placeholder={'{"name": "mools"}'}
    convert={(text) => jsonToYaml(text)}
    outputTitle="YAML Output"
    filename="data.yaml"
    mime="application/yaml"
/>
