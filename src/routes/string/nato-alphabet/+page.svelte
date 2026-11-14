<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { textToNato } from "#lib/devUtils.js";
</script>

<ConvertPage
    title="Text to NATO Alphabet"
    description="Spell out text with the NATO phonetic alphabet, e.g. A becomes Alpha."
    label="Text"
    placeholder="Hello world"
    rows={4}
    convert={textToNato}
    outputTitle="NATO Spelling"
/>
