<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { yamlToToml } from "#lib/formats.js";
</script>

<ConvertPage
    title="YAML to TOML"
    description="Convert a YAML document into TOML."
    label="YAML"
    placeholder={"title: Mools"}
    convert={(text) => yamlToToml(text)}
    outputTitle="TOML Output"
    filename="data.toml"
    mime="application/toml"
/>
