<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { RENAME_CASES, planRename, renameScript } from "#lib/bulk.js";
    import { downloadZip } from "#lib/zip.js";

    let names = $state("holiday photo 1.JPG\nholiday photo 2.JPG\nIMG_0042.png");
    let files = $state([]);
    let o = $state({ find: "", replace: "", regex: false, caseSensitive: true, caseMode: "none", prefix: "", suffix: "", numbering: "", start: 1, pad: 2, extension: "keep", newExtension: "" });
    let busy = $state(false);

    const list = $derived(names.split(/\r?\n/).map((n) => n.trim()).filter(Boolean));

    const result = $derived.by(() => {
        try {
            return { plan: planRename(list, { ...o, numbering: o.numbering || undefined, start: Number(o.start) || 0, pad: Number(o.pad) || 1 }), error: "" };
        } catch (e) {
            return { plan: [], error: e.message.includes("Invalid") ? "That regular expression is not valid." : e.message };
        }
    });

    const conflicts = $derived(result.plan.filter((p) => p.conflict).length);
    const changed = $derived(result.plan.filter((p) => p.changed).length);
    // A ZIP is only possible while the names still match the chosen files one to one.
    const canZip = $derived(files.length > 0 && result.plan.length === files.length && result.plan.every((p, i) => p.from === files[i].name) && conflicts === 0);

    const onPick = (event) => {
        files = [...event.currentTarget.files];
        names = files.map((f) => f.name).join("\n");
    };

    const zip = async () => {
        busy = true;
        const entries = [];
        for (const [i, file] of files.entries()) entries.push({ name: result.plan[i].to, data: new Uint8Array(await file.arrayBuffer()) });
        downloadZip(entries, "renamed-files.zip");
        busy = false;
    };
</script>

<svelte:head>
    <title>Bulk File Renamer | Mools</title>
</svelte:head>

<h1>Bulk File Renamer</h1>
<p class="text-body-secondary mb-3">
    Plan new names for many files with find and replace, prefixes, case changes and numbering. Choose files to download them as a renamed ZIP, or paste names to get a shell script. Nothing is uploaded.
</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="files" class="form-label">Choose files (optional)</label>
                <input id="files" class="form-control" type="file" multiple onchange={onPick} />
            </div>
            <div class="mb-3">
                <label for="names" class="form-label">File names ({list.length})</label>
                <textarea id="names" class="form-control font-monospace" rows="6" spellcheck="false" bind:value={names}></textarea>
            </div>
            <div class="row g-2 mb-2">
                <div class="col-6"><label for="find" class="form-label small mb-0">Find</label><input id="find" class="form-control" bind:value={o.find} /></div>
                <div class="col-6"><label for="replace" class="form-label small mb-0">Replace with</label><input id="replace" class="form-control" bind:value={o.replace} /></div>
            </div>
            <div class="d-flex gap-3 mb-3">
                <div class="form-check"><input id="regex" class="form-check-input" type="checkbox" bind:checked={o.regex} /><label class="form-check-label" for="regex">Regex</label></div>
                <div class="form-check"><input id="cs" class="form-check-input" type="checkbox" bind:checked={o.caseSensitive} /><label class="form-check-label" for="cs">Case sensitive</label></div>
            </div>
            <div class="row g-2 mb-3">
                <div class="col-6"><label for="prefix" class="form-label small mb-0">Prefix</label><input id="prefix" class="form-control" bind:value={o.prefix} /></div>
                <div class="col-6"><label for="suffix" class="form-label small mb-0">Suffix</label><input id="suffix" class="form-control" bind:value={o.suffix} /></div>
                <div class="col-6">
                    <label for="case-mode" class="form-label small mb-0">Name case</label>
                    <select id="case-mode" class="form-select" bind:value={o.caseMode}>{#each RENAME_CASES as mode (mode)}<option value={mode}>{mode === "none" ? "Keep" : mode}</option>{/each}</select>
                </div>
                <div class="col-6">
                    <label for="extension" class="form-label small mb-0">Extension</label>
                    <select id="extension" class="form-select" bind:value={o.extension}><option value="keep">Keep</option><option value="lower">lowercase</option><option value="remove">Remove</option><option value="set">Set to...</option></select>
                </div>
                {#if o.extension === "set"}
                    <div class="col-12"><input class="form-control" aria-label="New extension" placeholder="jpg" bind:value={o.newExtension} /></div>
                {/if}
            </div>
            <div class="row g-2">
                <div class="col-md-4">
                    <label for="numbering" class="form-label small mb-0">Numbering</label>
                    <select id="numbering" class="form-select" bind:value={o.numbering}><option value="">None</option><option value="suffix">After the name</option><option value="prefix">Before the name</option><option value="replace">Replace the name</option></select>
                </div>
                <div class="col-6 col-md-4"><label for="start" class="form-label small mb-0">Start at</label><input id="start" class="form-control" type="number" bind:value={o.start} /></div>
                <div class="col-6 col-md-4"><label for="pad" class="form-label small mb-0">Digits</label><input id="pad" class="form-control" type="number" min="1" max="8" bind:value={o.pad} /></div>
            </div>
        </div>
    </div>
    <div class="col-lg-6 d-flex flex-column gap-3">
        {#if result.error}
            <div class="alert alert-danger mb-0" role="alert">{result.error}</div>
        {:else}
            <div class="card p-3">
                <div class="d-flex align-items-center mb-2 gap-2">
                    <h2 class="h5 mb-0 me-auto">Preview ({changed} of {list.length} renamed)</h2>
                    <button class="btn btn-success btn-sm" type="button" disabled={!canZip || busy} title={canZip ? "" : "Choose files and resolve conflicts to enable the ZIP"} onclick={zip}><i class="bi bi-file-earmark-zip me-1"></i>ZIP</button>
                </div>
                {#if conflicts}<div class="alert alert-warning py-2" role="status">{conflicts} names clash or are empty. Adjust the rules (for example add numbering).</div>{/if}
                <div class="table-responsive" style="max-height: 22rem; overflow-y: auto;">
                    <table class="table table-sm mb-0">
                        <tbody>
                            {#each result.plan.slice(0, 300) as item, i (i)}
                                <tr class:table-warning={item.conflict}>
                                    <td class="text-break text-body-secondary">{item.from}</td>
                                    <td class="text-center"><i class="bi bi-arrow-right"></i></td>
                                    <td class="text-break fw-semibold">{item.to || "(empty)"}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
                {#if result.plan.length > 300}<p class="small text-body-secondary mt-2 mb-0">Showing 300 of {result.plan.length}.</p>{/if}
            </div>
            <OutputCard title="Shell script (mv)" text={renameScript(result.plan)} filename="rename.sh" />
            <OutputCard title="New names" text={result.plan.map((p) => p.to).join("\n")} filename="names.txt" />
        {/if}
    </div>
</div>
