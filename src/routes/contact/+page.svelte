<script>
    import { resolve } from "$app/paths";
    import { base } from "#lib/paths.js";
    import { tools } from "#lib/tools.js";
    import { REPO_URL } from "#lib/site.js";
    import { ISSUE_TYPES, buildIssueUrl } from "#lib/contact.js";

    const channels = [
        { title: "Report a bug", text: "Something broke or gave a wrong result? Tell us which tool and what you entered.", icon: "bi-bug", color: "text-danger", href: `${REPO_URL}/issues/new?template=bug_report.yml`, cta: "Open a bug report" },
        { title: "Request a tool", text: "Missing a utility you reach for every day? Suggest it and we will look at adding it.", icon: "bi-lightbulb", color: "text-warning", href: `${REPO_URL}/issues/new?template=tool_request.yml`, cta: "Suggest a tool" },
        { title: "Report a security issue", text: "Found a vulnerability? Please report it privately so it can be fixed before it is public.", icon: "bi-shield-lock", color: "text-success", href: `${REPO_URL}/security/advisories/new`, cta: "Report privately" },
        { title: "Contribute code", text: "Mools is open source. Fork the repo, add a tool and send a pull request.", icon: "bi-github", color: "text-primary", href: `${REPO_URL}#adding-a-tool`, cta: "Read the guide" }
    ];

    const faq = [
        ["Is my data sent anywhere?", "No. Tools run in your browser and your input is never uploaded. The only network request the site makes by itself is a small call to GitHub for the star count."],
        ["Can I use Mools offline?", "Not yet. After a page has loaded its tool keeps working without a connection, but the site is not installable as an offline app."],
        ["Can my AI agent use these tools?", "Yes. Mools publishes llms.txt and tools.json, registers its tools with WebMCP in supporting browsers and ships an MCP server. See the README for setup."],
        ["How do I get a reply?", "Issues are public on GitHub, so replies happen there. Please include the tool name and the steps to reproduce a problem."]
    ];

    let form = $state({ type: "bug", tool: "", title: "", message: "", includeBrowser: true });
    let error = $state("");

    const open = (event) => {
        event.preventDefault();
        error = "";
        try {
            const url = buildIssueUrl({
                type: form.type,
                tool: form.tool,
                title: form.title,
                message: form.message,
                page: form.tool ? `${location.origin}${base}${tools.find((t) => t.title === form.tool)?.path ?? ""}/` : "",
                userAgent: form.includeBrowser ? navigator.userAgent : ""
            });
            window.open(url, "_blank", "noopener");
        } catch (e) {
            error = e.message;
        }
    };
</script>

<svelte:head>
    <title>Contact | Mools</title>
    <meta name="description" content="Report a bug, request a tool, report a security issue or contribute to Mools, the open source developer tools collection." />
</svelte:head>

<div class="text-center mb-5">
    <img src="{base}/favicon.png" width="96" class="mb-3" alt="Mools logo" />
    <h1 class="display-5 mb-3">Get in touch</h1>
    <p class="lead text-body-secondary mb-0">Mools has no accounts or backend, so everything happens on GitHub in the open.</p>
</div>

<section class="mb-5" aria-labelledby="channels-heading">
    <h2 id="channels-heading" class="visually-hidden">Ways to reach us</h2>
    <div class="row g-3">
        {#each channels as channel (channel.title)}
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex align-items-center mb-2">
                            <i class="bi {channel.icon} fs-3 me-3 {channel.color}"></i>
                            <h3 class="h5 mb-0">{channel.title}</h3>
                        </div>
                        <p class="text-body-secondary flex-grow-1">{channel.text}</p>
                        <div>
                            <a class="btn btn-outline-primary btn-sm" href={channel.href} target="_blank" rel="noopener noreferrer">{channel.cta} <i class="bi bi-box-arrow-up-right ms-1"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</section>

<section class="mb-5" aria-labelledby="form-heading">
    <div class="card">
        <div class="card-body">
            <h2 id="form-heading" class="h4 mb-1">Write it here, send it on GitHub</h2>
            <p class="text-body-secondary mb-4">Fill in the form and we open a pre-filled GitHub issue for you to review and submit. A free GitHub account is needed to submit it.</p>
            <form onsubmit={open}>
                <div class="row g-3">
                    <div class="col-md-4">
                        <label for="type" class="form-label">Type</label>
                        <select id="type" class="form-select" bind:value={form.type}>
                            {#each Object.entries(ISSUE_TYPES) as [id, meta] (id)}
                                <option value={id}>{meta.label}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="col-md-8">
                        <label for="tool" class="form-label">Tool (optional)</label>
                        <select id="tool" class="form-select" bind:value={form.tool}>
                            <option value="">Not about a specific tool</option>
                            {#each [...tools].sort((a, b) => a.title.localeCompare(b.title)) as tool (tool.path)}
                                <option>{tool.title}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="col-12">
                        <label for="title" class="form-label">Title</label>
                        <input id="title" class="form-control" placeholder="A short summary" bind:value={form.title} />
                    </div>
                    <div class="col-12">
                        <label for="message" class="form-label">Details</label>
                        <textarea id="message" class="form-control" rows="6" placeholder={form.type === "bug" ? "What did you do, what did you expect and what happened instead?" : form.type === "tool" ? "What should the tool do? Share an example input and output." : "What is on your mind?"} bind:value={form.message}></textarea>
                    </div>
                    <div class="col-12">
                        <div class="form-check">
                            <input id="browser" class="form-check-input" type="checkbox" bind:checked={form.includeBrowser} />
                            <label class="form-check-label" for="browser">Include my browser details (helps to reproduce bugs)</label>
                        </div>
                    </div>
                    {#if error}
                        <div class="col-12"><div class="alert alert-danger py-2 mb-0" role="alert">{error}</div></div>
                    {/if}
                    <div class="col-12">
                        <button class="btn btn-primary" type="submit"><i class="bi bi-github me-1"></i>Open on GitHub</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</section>

<section class="mb-5" aria-labelledby="faq-heading">
    <h2 id="faq-heading" class="h4 mb-3">Questions</h2>
    <div class="d-flex flex-column gap-2">
        {#each faq as [question, answer] (question)}
            <details class="card">
                <summary class="card-body py-3 fw-semibold">{question}</summary>
                <div class="card-body pt-0 text-body-secondary">{answer}</div>
            </details>
        {/each}
    </div>
</section>

<p class="text-center text-body-secondary">
    Mools is maintained by <a href="https://github.com/maling-it" rel="noreferrer">maling-it</a>.
    Learn more on the <a href={resolve("/about/")}>About page</a>.
</p>

<style>
    summary {
        cursor: pointer;
        list-style-position: inside;
    }
</style>
