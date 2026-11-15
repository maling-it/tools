<script>
    import { onMount } from "svelte";
    import { createRegexRunner, isRegexSuperseded } from "#lib/safeRegex.js";
    import { regexMatches } from "#lib/regexMatches.js";
    let pattern = $state("(\\w+)@(\\w+)\\.com");
    let flags = $state("g");
    let text = $state("alice@example.com, bob@test.com");
    let replacement = $state("");

    const FLAG_OPTIONS = [["g", "global"], ["i", "ignore case"], ["m", "multiline"], ["s", "dot all"], ["u", "unicode"]];

    // The pattern runs in a worker with a time limit: a pattern with nested repeats such as (a+)+$ would otherwise freeze the page.
    const runner = createRegexRunner();
    // The starting example is safe to run directly, so the page already shows its matches when it is first rendered.
    // svelte-ignore state_referenced_locally
    let result = $state({ ...regexMatches({ pattern, flags, text, replacement }), error: "" });

    $effect(() => {
        const job = { type: "matches", pattern, flags, text, replacement };
        if (pattern === "") {
            result = { matches: [], replaced: "", error: "" };
            runner.close();
            return;
        }
        let cancelled = false;
        runner.run(job).then(
            ({ matches, replaced }) => {
                if (!cancelled) result = { matches, replaced, error: "" };
            },
            (e) => {
                if (cancelled || isRegexSuperseded(e)) return;
                result = { matches: [], replaced: "", error: e.message };
            }
        );
        return () => (cancelled = true);
    });

    onMount(() => () => runner.close());

    const toggle = (flag) => {
        flags = flags.includes(flag) ? flags.replace(flag, "") : flags + flag;
    };
</script>

<svelte:head>
    <title>Regex Tester | Mools</title>
</svelte:head>

<h1>Regex Tester</h1>
<p class="text-body-secondary mb-3">Test JavaScript regular expressions, see every match with its capture groups, and preview replacements.</p>

<div class="row g-3">
    <div class="col-lg-6">
        <div class="card p-3">
            <div class="mb-3">
                <label for="pattern" class="form-label">Pattern</label>
                <input id="pattern" class="form-control font-monospace" bind:value={pattern} spellcheck="false" />
            </div>
            <div class="mb-3 d-flex flex-wrap gap-3">
                {#each FLAG_OPTIONS as [flag, name] (flag)}
                    <div class="form-check">
                        <input id="flag-{flag}" class="form-check-input" type="checkbox" checked={flags.includes(flag)} onchange={() => toggle(flag)} />
                        <label class="form-check-label" for="flag-{flag}"><code>{flag}</code> {name}</label>
                    </div>
                {/each}
            </div>
            <div class="mb-3">
                <label for="text" class="form-label">Text</label>
                <textarea id="text" class="form-control font-monospace" rows="8" bind:value={text} spellcheck="false"></textarea>
            </div>
            <div>
                <label for="replacement" class="form-label">Replacement (optional, supports $1, $&amp;)</label>
                <input id="replacement" class="form-control font-monospace" bind:value={replacement} spellcheck="false" />
            </div>
        </div>
    </div>
    <div class="col-lg-6 d-flex flex-column gap-3">
        {#if result.error}
            <div class="alert alert-danger mb-0" role="alert">{result.error}</div>
        {:else}
            <div class="card p-3">
                <h2 class="h5 card-title">{result.matches.length} match{result.matches.length === 1 ? "" : "es"}</h2>
                <ul class="list-group">
                    {#each result.matches as match, i (i)}
                        <li class="list-group-item">
                            <code class="text-break">{match.text}</code> <small class="text-body-secondary">at {match.index}</small>
                            {#each match.groups as group, g (g)}
                                <div class="small text-body-secondary">Group {g + 1}: <code>{group ?? "undefined"}</code></div>
                            {/each}
                            {#if match.named}
                                {#each Object.entries(match.named) as [name, value] (name)}
                                    <div class="small text-body-secondary">{name}: <code>{value}</code></div>
                                {/each}
                            {/if}
                        </li>
                    {:else}
                        <li class="list-group-item text-body-secondary">No matches.</li>
                    {/each}
                </ul>
            </div>
            {#if result.replaced}
                <div class="card p-3">
                    <h2 class="h5 card-title">Replaced text</h2>
                    <pre class="mb-0 text-break" style="white-space: pre-wrap;">{result.replaced}</pre>
                </div>
            {/if}
        {/if}
    </div>
</div>
