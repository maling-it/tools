<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { caseConverters } from "#lib/textUtils.js";

    let text = $state("");

    const labels = {
        upper: "UPPERCASE",
        lower: "lowercase",
        title: "Title Case",
        sentence: "Sentence case",
        camel: "camelCase",
        pascal: "PascalCase",
        snake: "snake_case",
        kebab: "kebab-case",
        constant: "CONSTANT_CASE"
    };

    const actions = Object.entries(caseConverters).map(([key, transform]) => ({
        label: labels[key],
        transform
    }));
</script>

<ToolPage
    title="Change Case Tool"
    description="Convert your text between different letter cases and naming styles."
    bind:value={text}
    {actions}
/>
