<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { SPELLING_SYSTEMS, convertSpelling } from "#lib/converters.js";

    let system = $state("van-ophuijsen");
    let direction = $state("to-old");
    let keep = $state("");

    const pairs = $derived(SPELLING_SYSTEMS[system].pairs);
    const examples = {
        "to-old": "Yang jauh itu cukup. Nyonya Yanti membeli sayur di Juanda, khusus untuk acara besok.",
        "to-modern": "Jang djaoeh itoe tjoekoep. Njonja Janti membeli sajoer di Djoeanda, choesoes oentoek atjara besok."
    };
</script>

<ConvertPage
    title="Old Indonesian Spelling Converter"
    description="Convert Indonesian text between modern spelling and the old spellings, in either direction: Van Ophuijsen (1901 to 1947) or the Republican spelling (1947 to 1972, before the EYD). ALL CAPS and Capitalized words keep their casing, and web and email addresses are left alone."
    label={direction === "to-old" ? "Modern Indonesian" : "Old Indonesian"}
    placeholder={examples[direction]}
    rows={8}
    convert={(text) => convertSpelling(text, { system, direction, keep })}
    outputTitle={direction === "to-old" ? SPELLING_SYSTEMS[system].name : "Modern spelling"}
    filename="spelling.txt"
>
    {#snippet extra()}
        <div class="row g-3 mb-3">
            <div class="col-12">
                <label for="spelling-system" class="form-label">Old spelling</label>
                <select id="spelling-system" class="form-select" bind:value={system}>
                    {#each Object.entries(SPELLING_SYSTEMS) as [id, spelling] (id)}
                        <option value={id}>{spelling.name}</option>
                    {/each}
                </select>
            </div>
            <div class="col-6">
                <label for="spelling-direction" class="form-label">Direction</label>
                <select id="spelling-direction" class="form-select" bind:value={direction}>
                    <option value="to-old">Modern to old</option>
                    <option value="to-modern">Old to modern</option>
                </select>
            </div>
            <div class="col-6">
                <label for="spelling-keep" class="form-label">Keep these words</label>
                <input id="spelling-keep" class="form-control" type="text" bind:value={keep} placeholder="Google, Yoga" autocomplete="off" spellcheck="false" />
            </div>
        </div>
        <details class="mb-3">
            <summary>Letters that change</summary>
            <table class="table table-sm w-auto mt-2 mb-0">
                <caption class="visually-hidden">Modern letters and their old spelling</caption>
                <thead>
                    <tr><th scope="col">Modern</th><th scope="col">{SPELLING_SYSTEMS[system].name}</th><th scope="col">Example</th></tr>
                </thead>
                <tbody>
                    {#each pairs as [modern, old] (modern)}
                        <tr>
                            <td><code>{modern}</code></td>
                            <td><code>{old}</code></td>
                            <td>{convertSpelling({ ny: "nyonya", sy: "syarat", kh: "akhir", j: "jalan", y: "yang", c: "cuci", u: "ibu" }[modern], { system })}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            <p class="small text-body-secondary mt-2 mb-0">
                Old spellings also marked the pepet and taling "e" (ĕ and é) and the glottal stop. Modern text does not say which is which, so those cannot be added automatically.
            </p>
        </details>
    {/snippet}
</ConvertPage>
