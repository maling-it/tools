<script>
    import OutputCard from "../../../components/OutputCard.svelte";
    import { RULE_FORMATS, buildRulesFile } from "#lib/vibe.js";

    let format = $state("agents");
    let form = $state({
        project: "",
        description: "",
        stack: "",
        install: "",
        dev: "",
        test: "",
        lint: "",
        build: "",
        structure: "",
        conventions: "",
        dos: "",
        donts: ""
    });

    const file = $derived(
        buildRulesFile({
            format,
            project: form.project,
            description: form.description,
            stack: form.stack,
            commands: { install: form.install, dev: form.dev, test: form.test, lint: form.lint, build: form.build },
            structure: form.structure,
            conventions: form.conventions,
            dos: form.dos,
            donts: form.donts
        })
    );
</script>

<svelte:head>
    <title>AGENTS.md & Rules Generator | Mools</title>
</svelte:head>

<h1>AGENTS.md & Rules Generator</h1>
<p class="text-body-secondary mb-3">
    Give coding agents the context they need. Fill in the form once and export it as AGENTS.md, CLAUDE.md, a Cursor rule, Copilot instructions or Windsurf rules. Put the file in your project root.
</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="format" class="form-label">Output format</label>
                <select id="format" class="form-select" bind:value={format}>
                    {#each Object.entries(RULE_FORMATS) as [id, meta] (id)}
                        <option value={id}>{meta.label}</option>
                    {/each}
                </select>
                <div class="form-text">{RULE_FORMATS[format].note}</div>
            </div>
            <div class="mb-3">
                <label for="project" class="form-label">Project name</label>
                <input id="project" class="form-control" bind:value={form.project} />
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">What it does</label>
                <textarea id="description" class="form-control" rows="2" bind:value={form.description}></textarea>
            </div>
            <div class="mb-3">
                <label for="stack" class="form-label">Tech stack (one per line)</label>
                <textarea id="stack" class="form-control" rows="3" placeholder={"SvelteKit 3\nBootstrap 5\nVitest"} bind:value={form.stack}></textarea>
            </div>
            <div class="row g-2 mb-3">
                {#each [["install", "Install"], ["dev", "Dev server"], ["test", "Test"], ["lint", "Lint"], ["build", "Build"]] as [key, label] (key)}
                    <div class="col-6">
                        <label for={key} class="form-label small mb-0">{label} command</label>
                        <input id={key} class="form-control form-control-sm font-monospace" bind:value={form[key]} spellcheck="false" />
                    </div>
                {/each}
            </div>
            <div class="mb-3">
                <label for="structure" class="form-label">Project structure (optional)</label>
                <textarea id="structure" class="form-control font-monospace" rows="4" placeholder={"src/lib/  shared logic\nsrc/routes/  pages"} bind:value={form.structure}></textarea>
            </div>
            <div class="mb-3">
                <label for="conventions" class="form-label">Conventions (one per line)</label>
                <textarea id="conventions" class="form-control" rows="3" bind:value={form.conventions}></textarea>
            </div>
            <div class="mb-3">
                <label for="dos" class="form-label">Always do (one per line)</label>
                <textarea id="dos" class="form-control" rows="2" bind:value={form.dos}></textarea>
            </div>
            <div>
                <label for="donts" class="form-label">Never do (one per line)</label>
                <textarea id="donts" class="form-control" rows="2" bind:value={form.donts}></textarea>
            </div>
        </div>
    </div>
    <div class="col-lg-6">
        <OutputCard title={file.filename} text={file.content} filename={file.filename.split("/").pop()} mime="text/markdown" />
        <p class="small text-body-secondary mt-2">Save as <code>{file.filename}</code>. Keep it short: agents follow a few clear rules better than a long list.</p>
    </div>
</div>
