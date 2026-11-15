<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { minifyCss } from "#lib/utilities.js";
</script>

<ConvertPage
    title="CSS Minifier"
    description="Remove comments and whitespace, shorten hex colors and drop the last semicolon of each block. Strings, url() values and /*! important */ comments are left alone. Percentages and units are never touched, so calc() and keyframes stay valid."
    label="CSS"
    placeholder={"body {\n  margin: 0;\n  color: #ffffff; /* white */\n}"}
    rows={12}
    convert={minifyCss}
    outputTitle="Minified CSS"
    filename="styles.min.css"
    mime="text/css"
/>
