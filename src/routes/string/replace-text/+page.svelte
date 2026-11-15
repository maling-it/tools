<script>
    import ToolPage from "../../../components/ToolPage.svelte";
    import { onMount } from "svelte";
    import { replaceText } from "#lib/textUtils.js";
    import { createRegexRunner, isRegexTimeout } from "#lib/safeRegex.js";

    let text = $state("");
    let find = $state("");
    let replacement = $state("");
    let regex = $state(false);
    let caseSensitive = $state(true);
    let status = $state("");

    // Patterns run in a worker with a time limit, so one with nested repeats cannot freeze the page.
    const runner = createRegexRunner();
    onMount(() => () => runner.close());

    const actions = [
        {
            label: "Replace All",
            transform: async (value) => {
                status = "";
                const options = { regex, caseSensitive };
                try {
                    const result = regex
                        ? await runner.run({ type: "replace", text: value, find, replacement, options })
                        : replaceText(value, find, replacement, options);
                    status = `${result.count} replacement${result.count === 1 ? "" : "s"} made.`;
                    return result.text;
                } catch (e) {
                    if (isRegexTimeout(e)) throw e;
                    throw new Error("Invalid regular expression.");
                }
            }
        }
    ];
</script>

<ToolPage
    title="Replace Text Tool"
    description="Find and replace text in your content."
    bind:value={text}
    {actions}
>
    {#snippet extra()}
        <div class="mb-3">
            <label for="find-input" class="form-label">Find</label>
            <input id="find-input" class="form-control font-monospace" bind:value={find} placeholder="Text to find" />
        </div>
        <div class="mb-3">
            <label for="replace-input" class="form-label">Replace With</label>
            <input id="replace-input" class="form-control font-monospace" bind:value={replacement} placeholder="Replacement text" />
        </div>
        <div class="mb-3 d-flex gap-3 flex-wrap">
            <div class="form-check">
                <input id="regex-check" class="form-check-input" type="checkbox" bind:checked={regex} />
                <label class="form-check-label" for="regex-check">Regular expression</label>
            </div>
            <div class="form-check">
                <input id="case-check" class="form-check-input" type="checkbox" bind:checked={caseSensitive} />
                <label class="form-check-label" for="case-check">Case sensitive</label>
            </div>
        </div>
        {#if status}
            <p class="small text-body-secondary">{status}</p>
        {/if}
    {/snippet}
</ToolPage>
