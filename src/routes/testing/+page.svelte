<script>
    import { base } from '$app/paths';

    const testingTools = [
        {
            title: "Telegram Bot Tester",
            description: "Test your Telegram bot with messages, photos, and documents. Generate curl commands for API testing",
            icon: "bi-chat-dots",
            link: `${base}/testing/telegram`,
            features: ["Send Messages", "Upload Photos", "Send Documents", "Curl Generator"]
        }
    ];

    const comingSoonTools = [
        {
            title: "REST API Tester",
            description: "Test REST APIs with different HTTP methods and request formats",
            icon: "bi-cloud-arrow-up",
            features: ["HTTP Methods", "Request Headers", "JSON/XML Bodies", "Response Analysis"]
        },
        {
            title: "WebSocket Tester",
            description: "Test WebSocket connections and real-time messaging",
            icon: "bi-broadcast",
            features: ["WebSocket Connect", "Send Messages", "Real-time Testing", "Connection Monitor"]
        },
        {
            title: "JSON Validator",
            description: "Validate and format JSON data with error detection",
            icon: "bi-check-circle",
            features: ["JSON Validation", "Error Detection", "Pretty Print", "Schema Validation"]
        }
    ];
</script>

<svelte:head>
    <title>Testing Tools - API & Development Testing Utilities</title>
    <meta name="description" content="Testing and debugging tools for developers including API testers, validators, and debugging utilities.">
</svelte:head>

<!-- Header Section -->
<div class="d-flex align-items-center mb-4">
    <div class="category-icon-large me-3">
        <i class="bi bi-bug fs-1"></i>
    </div>
    <div>
        <h1 class="mb-2">Testing Tools</h1>
        <p class="text-muted mb-0">API testing and debugging utilities for developers</p>
    </div>
</div>

<!-- Available Tools -->
<section class="mb-5">
    <h2 class="h4 mb-3">Available Tools</h2>
    <div class="row g-4">
        {#each testingTools as tool}
            <div class="col-md-6 col-lg-4">
                <a href={tool.link} class="text-decoration-none">
                    <div class="card h-100 tool-card">
                        <div class="card-body">
                            <div class="d-flex align-items-start mb-3">
                                <div class="tool-icon me-3">
                                    <i class="{tool.icon} fs-4"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <h5 class="card-title mb-2">{tool.title}</h5>
                                </div>
                            </div>
                            <p class="card-text text-muted mb-3">{tool.description}</p>
                            <div class="features-list">
                                {#each tool.features as feature}
                                    <span class="badge bg-light text-dark me-1 mb-1">{feature}</span>
                                {/each}
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0 pt-0">
                            <div class="d-flex align-items-center text-primary">
                                <span class="small fw-medium">Try this tool</span>
                                <i class="bi bi-arrow-right ms-2"></i>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        {/each}
    </div>
</section>

<!-- Coming Soon -->
<section class="mb-5">
    <h2 class="h4 mb-3">Coming Soon</h2>
    <div class="row g-4">
        {#each comingSoonTools as tool}
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 coming-soon-card">
                    <div class="card-body">
                        <div class="d-flex align-items-start mb-3">
                            <div class="tool-icon-disabled me-3">
                                <i class="{tool.icon} fs-4"></i>
                            </div>
                            <div class="flex-grow-1">
                                <h5 class="card-title mb-2">{tool.title}</h5>
                                <span class="badge bg-warning text-dark">Coming Soon</span>
                            </div>
                        </div>
                        <p class="card-text text-muted mb-3">{tool.description}</p>
                        <div class="features-list">
                            {#each tool.features as feature}
                                <span class="badge bg-light text-muted me-1 mb-1">{feature}</span>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</section>

<!-- Developer Guide -->
<section class="mt-5">
    <div class="card">
        <div class="card-body">
            <h3 class="h5 mb-3">
                <i class="bi bi-code-square me-2"></i>
                Developer Resources
            </h3>
            <div class="row">
                <div class="col-md-6">
                    <h6 class="fw-bold">API Testing Best Practices</h6>
                    <ul class="list-unstyled small">
                        <li class="mb-1">• Test with real data scenarios</li>
                        <li class="mb-1">• Validate response formats</li>
                        <li class="mb-1">• Check error handling</li>
                        <li class="mb-1">• Monitor rate limits</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6 class="fw-bold">Security Considerations</h6>
                    <ul class="list-unstyled small">
                        <li class="mb-1">• Never expose API keys in public</li>
                        <li class="mb-1">• Use HTTPS for sensitive data</li>
                        <li class="mb-1">• Validate input parameters</li>
                        <li class="mb-1">• Test authentication flows</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    .category-icon-large {
        width: 80px;
        height: 80px;
        border-radius: 16px;
        background: var(--bs-primary-bg-subtle);
        color: var(--bs-primary);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .tool-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        border: 1px solid var(--bs-border-color);
    }

    .tool-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .coming-soon-card {
        opacity: 0.7;
        border: 1px dashed var(--bs-border-color);
    }

    .tool-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: var(--bs-primary-bg-subtle);
        color: var(--bs-primary);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .tool-icon-disabled {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background: var(--bs-light);
        color: var(--bs-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .features-list .badge {
        font-size: 0.75rem;
        font-weight: normal;
    }

    a:hover .card {
        text-decoration: none;
    }
</style>