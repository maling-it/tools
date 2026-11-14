<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { xmlToJson } from "#lib/htmlTools.js";
</script>

<ConvertPage
    title="XML to JSON"
    description="Convert XML into JSON. Attributes are prefixed with @, repeated elements become arrays."
    label="XML"
    placeholder={'<note id="1"><to>Jane</to></note>'}
    convert={(xml) => xmlToJson(xml)}
    outputTitle="JSON Output"
    filename="data.json"
    mime="application/json"
/>
