<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { tomlToJson } from "#lib/formats.js";
</script>

<ConvertPage
    title="TOML to JSON"
    description="Convert TOML into formatted JSON."
    label="TOML"
    placeholder={"title = \"Mools\"\n\n[owner]\nname = \"maling-it\""}
    convert={(text) => tomlToJson(text)}
    outputTitle="JSON Output"
    filename="data.json"
    mime="application/json"
/>
