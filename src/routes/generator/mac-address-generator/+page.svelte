<script>
    import { onMount } from "svelte";
    import ResultList from "../../../components/ResultList.svelte";
    import OutputCard from "../../../components/OutputCard.svelte";
    import { generateMacs, macReport } from "#lib/utilities.js";

    let count = $state(5);
    let format = $state("colon");
    let uppercase = $state(false);
    let local = $state(true);
    let unicast = $state(true);
    let items = $state([]);
    let convertInput = $state("");

    const generate = () => (items = generateMacs(count, { format, uppercase, local, unicast }));
    const report = $derived.by(() => {
        if (convertInput.trim() === "") return { text: "", error: "" };
        try {
            return { text: macReport(convertInput), error: "" };
        } catch (e) {
            return { text: "", error: e.message };
        }
    });

    // Generated in the browser only, so random addresses never end up in the prerendered HTML.
    onMount(generate);
</script>

<svelte:head>
    <title>MAC Address Generator | Mools</title>
</svelte:head>

<h1>MAC Address Generator</h1>
<p class="text-body-secondary mb-3">
    Generate random MAC addresses, or paste addresses to see them in every notation. Locally administered unicast addresses (the default) never clash with real hardware.
</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <div class="mb-3">
                <label for="mac-count" class="form-label">How many</label>
                <input id="mac-count" class="form-control w-auto" type="number" min="1" max="100" bind:value={count} />
            </div>
            <div class="mb-3">
                <label for="mac-format" class="form-label">Notation</label>
                <select id="mac-format" class="form-select" bind:value={format} onchange={generate}>
                    <option value="colon">Colon (00:1a:2b:3c:4d:5e)</option>
                    <option value="hyphen">Hyphen (00-1a-2b-3c-4d-5e)</option>
                    <option value="dot">Cisco dot (001a.2b3c.4d5e)</option>
                    <option value="plain">Plain (001a2b3c4d5e)</option>
                </select>
            </div>
            <div class="form-check"><input id="mac-upper" class="form-check-input" type="checkbox" bind:checked={uppercase} onchange={generate} /><label class="form-check-label" for="mac-upper">Uppercase</label></div>
            <div class="form-check"><input id="mac-local" class="form-check-input" type="checkbox" bind:checked={local} onchange={generate} /><label class="form-check-label" for="mac-local">Locally administered</label></div>
            <div class="form-check mb-3"><input id="mac-unicast" class="form-check-input" type="checkbox" bind:checked={unicast} onchange={generate} /><label class="form-check-label" for="mac-unicast">Unicast</label></div>
            <div><button class="btn btn-primary" type="button" onclick={generate}>Generate</button></div>
        </div>
    </div>
    <div class="col-lg-7">
        <ResultList {items} title="MAC addresses" />
    </div>
</div>

<h2 class="h4 mt-4">Convert and inspect</h2>
<div class="row g-3">
    <div class="col-lg-5">
        <label for="mac-input" class="form-label">MAC addresses, one per line</label>
        <textarea id="mac-input" class="form-control font-monospace" rows="5" placeholder="00-1A-2B-3C-4D-5E" bind:value={convertInput} aria-describedby={report.error ? "mac-error" : undefined}></textarea>
        {#if report.error}<div id="mac-error" class="alert alert-danger mt-2 mb-0" role="alert">{report.error}</div>{/if}
    </div>
    <div class="col-lg-7"><OutputCard title="Notations and type" text={report.text} /></div>
</div>
