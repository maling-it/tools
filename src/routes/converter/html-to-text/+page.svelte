<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { htmlToText } from "#lib/htmlTools.js";
</script>

<ConvertPage
    title="HTML to Text"
    description="Strip HTML tags, scripts and styles to get clean plain text."
    label="HTML"
    placeholder="<h1>Hello</h1><p>World</p>"
    convert={htmlToText}
    outputTitle="Plain Text"
    filename="text.txt"
/>
