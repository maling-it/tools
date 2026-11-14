<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { applyLineTool } from "#lib/devUtils.js";

    let text = $state("");

    const labels = {
        sort: "Sort A-Z",
        sortDescending: "Sort Z-A",
        reverse: "Reverse",
        unique: "Remove duplicates",
        shuffle: "Shuffle",
        trim: "Trim lines",
        removeEmpty: "Remove empty lines",
        number: "Number lines"
    };

    const actions = Object.entries(labels).map(([tool, label]) => ({
        label,
        variant: "btn-outline-primary",
        transform: (value) => applyLineTool(value, tool)
    }));
</script>

<ToolPage
    title="Line Tools"
    description="Sort, reverse, de-duplicate, shuffle and clean up lists, one item per line."
    bind:value={text}
    label="Lines"
    placeholder={"banana\napple\ncherry"}
    {actions}
/>
