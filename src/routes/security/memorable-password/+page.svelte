<script>
    import { onMount } from "svelte";
    import ResultList from "../../../components/ResultList.svelte";
    import { memorablePassword, WORDS } from "#lib/generators.js";

    let words = $state(4);
    let separator = $state("-");
    let capitalize = $state(true);
    let addNumber = $state(true);
    let passwords = $state([]);

    const generate = () => {
        passwords = Array.from({ length: 5 }, () => memorablePassword({ words, separator, capitalize, addNumber }));
    };

    onMount(generate);
</script>

<svelte:head>
    <title>Memorable Password | Mools</title>
</svelte:head>

<h1>Memorable Password</h1>
<p class="text-body-secondary mb-3">Generate passphrases made of random words that are easier to remember and type.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="words" class="form-label">Words: {words}</label>
                <input id="words" class="form-range" type="range" min="2" max="8" bind:value={words} />
            </div>
            <div class="mb-3">
                <label for="separator" class="form-label">Separator</label>
                <select id="separator" class="form-select w-auto" bind:value={separator}>
                    <option value="-">Hyphen (-)</option>
                    <option value=".">Dot (.)</option>
                    <option value="_">Underscore (_)</option>
                    <option value=" ">Space</option>
                    <option value="">None</option>
                </select>
            </div>
            <div class="form-check">
                <input id="capitalize" class="form-check-input" type="checkbox" bind:checked={capitalize} />
                <label class="form-check-label" for="capitalize">Capitalize words</label>
            </div>
            <div class="form-check mb-3">
                <input id="number" class="form-check-input" type="checkbox" bind:checked={addNumber} />
                <label class="form-check-label" for="number">Add a number</label>
            </div>
            <div>
                <button class="btn btn-primary" type="button" onclick={generate}>Generate</button>
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        <ResultList items={passwords} title="Passphrases" />
        <p class="small text-body-secondary mt-2">{words} words from a {WORDS.length} word list is about {Math.round(words * Math.log2(WORDS.length))} bits; use 6 or more words for important accounts.</p>
    </div>
</div>
