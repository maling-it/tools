<script>
    import "halfmoon/css/halfmoon.min.css";
    import "halfmoon/css/cores/halfmoon.cores.css";
    import "bootstrap-icons/font/bootstrap-icons.css";
    import "../app.css";
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { base } from "#lib/paths.js";
    import { tools } from "#lib/tools.js";
    import { SITE_DESCRIPTION, SITE_URL } from "#lib/site.js";
    import Navbar from "../components/Navbar.svelte";
    import Sidebar from "../components/Sidebar.svelte";

    let { children } = $props();

    // Bootstrap's JS powers the offcanvas sidebar and dropdowns; it touches `document`, so load it client-side only.
    onMount(() => {
        import("bootstrap/dist/js/bootstrap.bundle.min.js");
        registerWebMcpTools();
    });

    // WebMCP: let in-browser agents call the tools directly (navigator.modelContext).
    const registerWebMcpTools = async () => {
        const modelContext = navigator.modelContext;
        if (!modelContext?.registerTool) return;
        const { agentTools, callAgentTool } = await import("#lib/agentTools.js");
        for (const tool of agentTools) {
            try {
                modelContext.registerTool({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                    annotations: { readOnlyHint: true },
                    execute: async (args) => {
                        try {
                            return { content: [{ type: "text", text: await callAgentTool(tool.name, args) }] };
                        } catch (error) {
                            return { isError: true, content: [{ type: "text", text: error.message }] };
                        }
                    }
                });
            } catch {
                // Already registered (e.g. after hot reload); nothing to do.
            }
        }
    };

    const tool = $derived(tools.find((t) => page.url.pathname === `${base}${t.path}/`));

    const structuredData = $derived(
        tool
            ? {
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  name: tool.title,
                  description: tool.description,
                  url: `${SITE_URL}${tool.path}/`,
                  applicationCategory: "DeveloperApplication",
                  operatingSystem: "Any",
                  isAccessibleForFree: true,
                  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
              }
            : page.url.pathname === `${base}/`
              ? { "@context": "https://schema.org", "@type": "WebSite", name: "Mools", url: `${SITE_URL}/`, description: SITE_DESCRIPTION }
              : null
    );
</script>

<svelte:head>
    <link rel="icon" href="{base}/favicon.png" />
    <link rel="alternate" type="text/plain" href="{base}/llms.txt" title="llms.txt" />
    {#if tool}
        <meta name="description" content={tool.description} />
        <link rel="canonical" href="{SITE_URL}{tool.path}/" />
    {/if}
    {#if structuredData}
        {@html `<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>`}
    {/if}
</svelte:head>

<Sidebar />
<Navbar />
<div class="container-md px-3 py-4 px-sm-4 px-xl-5">
    {@render children()}
</div>
