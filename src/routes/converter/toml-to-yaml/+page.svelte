<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { tomlToYaml } from "#lib/formats.js";
</script>

<ConvertPage
    title="TOML to YAML"
    description="Convert TOML into YAML."
    label="TOML"
    placeholder={"title = \"Mools\""}
    convert={(text) => tomlToYaml(text)}
    outputTitle="YAML Output"
    filename="data.yaml"
    mime="application/yaml"
/>
