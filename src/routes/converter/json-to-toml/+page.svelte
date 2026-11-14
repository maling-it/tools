<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { jsonToToml } from "#lib/formats.js";
</script>

<ConvertPage
    title="JSON to TOML"
    description="Convert a JSON object into TOML."
    label="JSON"
    placeholder={'{"title": "Mools"}'}
    convert={(text) => jsonToToml(text)}
    outputTitle="TOML Output"
    filename="data.toml"
    mime="application/toml"
/>
