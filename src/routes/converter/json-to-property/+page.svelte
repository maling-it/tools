<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { jsonToProperties } from "#lib/converters.js";
</script>

<ConvertPage
    title="JSON to Properties"
    description="Flatten JSON into Java-style .properties lines (a.b=1, list[0]=x)."
    label="JSON"
    placeholder={'{"app": {"name": "mools"}}'}
    convert={jsonToProperties}
    outputTitle="Properties"
    filename="application.properties"
/>
