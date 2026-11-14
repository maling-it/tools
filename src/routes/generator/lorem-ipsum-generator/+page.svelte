<script>
    import { onMount } from "svelte";
    import OutputCard from "../../../components/OutputCard.svelte";
    import { loremIpsum } from "#lib/devUtils.js";

    let unit = $state("paragraphs");
    let count = $state(3);
    let startWithLorem = $state(true);
    let text = $state("");

    const generate = () => (text = loremIpsum({ unit, count: Number(count), startWithLorem }));

    onMount(generate);
</script>

<svelte:head>
    <title>Lorem Ipsum Generator | Mools</title>
</svelte:head>

<h1>Lorem Ipsum Generator</h1>
<p class="text-body-secondary mb-3">Generate placeholder text by paragraphs, sentences or words.</p>

<div class="row g-3">
    <div class="col-lg-4">
        <div class="card p-3">
            <div class="mb-3">
                <label for="unit" class="form-label">Generate</label>
                <select id="unit" class="form-select" bind:value={unit}>
                    <option value="paragraphs">Paragraphs</option>
                    <option value="sentences">Sentences</option>
                    <option value="words">Words</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="count" class="form-label">Amount</label>
                <input id="count" class="form-control w-auto" type="number" min="1" max="200" bind:value={count} />
            </div>
            <div class="form-check mb-3">
                <input id="start" class="form-check-input" type="checkbox" bind:checked={startWithLorem} />
                <label class="form-check-label" for="start">Start with "Lorem ipsum"</label>
            </div>
            <div>
                <button class="btn btn-primary" type="button" onclick={generate}>Generate</button>
            </div>
        </div>
    </div>
    <div class="col-lg-8">
        <OutputCard title="Text" text={text} filename="lorem-ipsum.txt" />
    </div>
</div>
