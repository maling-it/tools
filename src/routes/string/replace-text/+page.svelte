<script>
    import ToolPage from "../../../components/ToolPage.svelte";

    let text = '';
    let find = '';
    let replaceWith = '';

    $: additionalInputs = [
        {
            id: "find-input",
            label: "Find",
            type: "text",
            placeholder: "Enter the text you want to replace",
            value: find,
            onInput: (e) => { find = e.target.value; }
        },
        {
            id: "replace-input", 
            label: "Replace With",
            type: "text",
            placeholder: "Enter the replacement text",
            value: replaceWith,
            onInput: (e) => { replaceWith = e.target.value; }
        }
    ];

    const buttons = [
        {
            label: "Replace",
            onClick: () => { text = text.split(find).join(replaceWith); }
        }
    ];
</script>

<ToolPage
    title="Replace Text Tool"
    description="Find and replace text in your content."
    bind:textValue={text}
    textPlaceholder="Enter your text here"
    textLabel="Text"
    {additionalInputs}
    {buttons}
/>