<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { toRoman, fromRoman } from "#lib/devUtils.js";

    let text = $state("");
    const actions = [
        { label: "Number to Roman", transform: (value) => toRoman(value.trim()) },
        { label: "Roman to Number", transform: (value) => String(fromRoman(value)) }
    ];
</script>

<ToolPage
    title="Roman Numeral Converter"
    description="Convert numbers from 1 to 3999 to Roman numerals and back."
    bind:value={text}
    label="Number or Roman numeral"
    placeholder="1994 or MCMXCIV"
    rows={2}
    {actions}
/>
