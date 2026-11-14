<script>
    import { onMount } from "svelte";
    import ResultList from "../../../components/ResultList.svelte";
    import { generatePassword, passwordEntropyBits } from "#lib/generators.js";

    let length = $state(16);
    let types = $state({ lower: true, upper: true, digits: true, symbols: true });
    let excludeAmbiguous = $state(false);
    let count = $state(5);
    let passwords = $state([]);
    let error = $state("");

    const poolSize = $derived(
        (types.lower ? 26 : 0) + (types.upper ? 26 : 0) + (types.digits ? 10 : 0) + (types.symbols ? 24 : 0) - (excludeAmbiguous ? 4 : 0)
    );

    const generate = () => {
        error = "";
        try {
            passwords = Array.from({ length: count }, () =>
                generatePassword({ length, ...types, excludeAmbiguous })
            );
        } catch (e) {
            passwords = [];
            error = e.message;
        }
    };

    // Generated on the client only so passwords never end up in the prerendered HTML.
    onMount(generate);
</script>

<svelte:head>
    <title>Password Generator | Mools</title>
</svelte:head>

<h1>Password Generator</h1>
<p class="text-body-secondary mb-3">Generate strong random passwords with your browser's secure random number generator.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="length" class="form-label">Length: {length}</label>
                <input id="length" class="form-range" type="range" min="4" max="64" bind:value={length} />
            </div>
            <div class="mb-3">
                <label for="count" class="form-label">How many</label>
                <input id="count" class="form-control w-auto" type="number" min="1" max="20" bind:value={count} />
            </div>
            {#each [["lower", "Lowercase (a-z)"], ["upper", "Uppercase (A-Z)"], ["digits", "Numbers (0-9)"], ["symbols", "Symbols (!@#$...)"]] as [key, text] (key)}
                <div class="form-check">
                    <input id={key} class="form-check-input" type="checkbox" bind:checked={types[key]} />
                    <label class="form-check-label" for={key}>{text}</label>
                </div>
            {/each}
            <div class="form-check mb-3">
                <input id="ambiguous" class="form-check-input" type="checkbox" bind:checked={excludeAmbiguous} />
                <label class="form-check-label" for="ambiguous">Exclude look-alikes (O, 0, l, 1, I)</label>
            </div>
            {#if error}
                <div class="alert alert-danger py-2" role="alert">{error}</div>
            {/if}
            <div>
                <button class="btn btn-primary" type="button" onclick={generate}>Generate</button>
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        <ResultList items={passwords} title="Passwords" />
        {#if poolSize > 0}
            <p class="small text-body-secondary mt-2">About {passwordEntropyBits(length, poolSize)} bits of entropy.</p>
        {/if}
    </div>
</div>
