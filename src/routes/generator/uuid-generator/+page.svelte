<script>
    import { onMount } from "svelte";
    import ResultList from "../../../components/ResultList.svelte";
    import { uuidV4, uuidV7, ulid, NIL_UUID } from "#lib/devUtils.js";

    let type = $state("v4");
    let count = $state(5);
    let uppercase = $state(false);
    let hyphens = $state(true);
    let items = $state([]);

    const make = { v4: uuidV4, v7: uuidV7, ulid, nil: () => NIL_UUID };

    const generate = () => {
        const n = Math.max(1, Math.min(Number(count) || 1, 100));
        items = Array.from({ length: n }, () => {
            let value = make[type]();
            if (type !== "ulid" && !hyphens) value = value.replaceAll("-", "");
            return uppercase && type !== "ulid" ? value.toUpperCase() : value;
        });
    };

    // Generated on the client only so identifiers never end up in the prerendered HTML.
    onMount(generate);
</script>

<svelte:head>
    <title>UUID & ULID Generator | Mools</title>
</svelte:head>

<h1>UUID & ULID Generator</h1>
<p class="text-body-secondary mb-3">Generate random UUIDs (v4), time-ordered UUIDs (v7), ULIDs or the nil UUID.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="type" class="form-label">Type</label>
                <select id="type" class="form-select" bind:value={type} onchange={generate}>
                    <option value="v4">UUID v4 (random)</option>
                    <option value="v7">UUID v7 (time-ordered)</option>
                    <option value="ulid">ULID</option>
                    <option value="nil">Nil UUID</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="count" class="form-label">How many</label>
                <input id="count" class="form-control w-auto" type="number" min="1" max="100" bind:value={count} />
            </div>
            <div class="form-check">
                <input id="upper" class="form-check-input" type="checkbox" bind:checked={uppercase} />
                <label class="form-check-label" for="upper">Uppercase</label>
            </div>
            <div class="form-check mb-3">
                <input id="hyphens" class="form-check-input" type="checkbox" bind:checked={hyphens} />
                <label class="form-check-label" for="hyphens">Hyphens</label>
            </div>
            <div>
                <button class="btn btn-primary" type="button" onclick={generate}>Generate</button>
            </div>
        </div>
    </div>
    <div class="col-lg-7">
        <ResultList {items} title="Identifiers" />
    </div>
</div>
