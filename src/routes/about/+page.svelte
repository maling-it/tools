<script>
    import { resolve } from '$app/paths';
    import { base } from '#lib/paths.js';
    import { categories, tools } from '#lib/tools.js';

    const teamMembers = [
        {
            name: "Memet",
            role: "Creator & Developer",
            description: "Full-stack developer passionate about creating useful tools for the community",
            icon: "bi-person-circle"
        }
    ];

    const features = [
        {
            title: "Built for AI Agents",
            description: "Every tool is also available to agents through llms.txt, tools.json, WebMCP and an MCP server.",
            icon: "bi-robot",
            color: "text-danger"
        },
        {
            title: "Privacy First",
            description: "All processing happens locally in your browser. No data is sent to external servers.",
            icon: "bi-shield-check",
            color: "text-success"
        },
        {
            title: "Open Source",
            description: "Built with modern web technologies like SvelteKit and Bootstrap. Code is transparent.",
            icon: "bi-code-square",
            color: "text-info"
        },
        {
            title: "Fast & Lightweight",
            description: "Optimized for speed and efficiency. Works great on all devices and connections.",
            icon: "bi-lightning",
            color: "text-warning"
        },
        {
            title: "Mobile Friendly",
            description: "Responsive design that works perfectly on desktop, tablet, and mobile devices.",
            icon: "bi-phone",
            color: "text-primary"
        }
    ];

    const techStack = [
        { name: "SvelteKit 3 + Svelte 5", description: "Web framework, prerendered to static pages" },
        { name: "Bootstrap 5 + Halfmoon", description: "UI framework with three switchable themes" },
        { name: "Vite 8", description: "Build tool and dev server" },
        { name: "Vitest", description: "Unit tests for all tool logic" },
        { name: "MCP + WebMCP", description: "Lets AI agents call the tools" }
    ];
</script>

<svelte:head>
    <title>About Mools - Project Information</title>
    <meta name="description" content="Learn more about Mools, our mission to provide useful online tools for developers and creators.">
</svelte:head>

<!-- Hero Section -->
<div class="text-center mb-5">
    <img src="{base}/favicon.png" width="120" class="mb-3" alt="Mools Logo">
    <h1 class="display-5 mb-3">About Mools</h1>
    <p class="lead text-muted">
        Making useful tools accessible to everyone, everywhere
    </p>
</div>

<!-- Mission Section -->
<section class="mb-5">
    <div class="card">
        <div class="card-body">
            <h2 class="h4 mb-3">
                <i class="bi bi-bullseye me-2"></i>
                Our Mission
            </h2>
            <p class="mb-3">
                Mools was created to provide developers, content creators, and digital workers with 
                quick access to essential online tools. Our goal is to make powerful utilities 
                available without the need for downloads, registrations, or complex setups.
            </p>
            <p class="mb-0">
                Every tool is designed with privacy, speed, and usability in mind. We believe that 
                useful software should be simple, fast, and respectful of your data.
            </p>
        </div>
    </div>
</section>

<!-- Features Section -->
<section class="mb-5">
    <h2 class="h4 mb-4">Why Choose Mools?</h2>
    <div class="row g-4">
        {#each features as feature}
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex align-items-start mb-3">
                            <div class="feature-icon me-3 {feature.color}">
                                <i class="{feature.icon} fs-3"></i>
                            </div>
                            <div>
                                <h5 class="card-title mb-2">{feature.title}</h5>
                                <p class="card-text text-muted">{feature.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</section>

<!-- Team Section -->
<section class="mb-5">
    <h2 class="h4 mb-4">Meet the Team</h2>
    <div class="row g-4">
        {#each teamMembers as member}
            <div class="col-md-4">
                <div class="card text-center">
                    <div class="card-body">
                        <div class="team-avatar mb-3">
                            <i class="{member.icon} fs-1"></i>
                        </div>
                        <h5 class="card-title">{member.name}</h5>
                        <p class="text-primary small fw-medium mb-2">{member.role}</p>
                        <p class="card-text text-muted small">{member.description}</p>
                    </div>
                </div>
            </div>
        {/each}
    </div>
</section>

<!-- Tech Stack Section -->
<section class="mb-5">
    <div class="card">
        <div class="card-body">
            <h3 class="h5 mb-3">
                <i class="bi bi-gear me-2"></i>
                Technology Stack
            </h3>
            <p class="text-muted mb-3">
                Mools is built with modern, reliable technologies to ensure performance and maintainability.
            </p>
            <div class="row">
                {#each techStack as tech}
                    <div class="col-md-6 mb-2">
                        <div class="d-flex align-items-center">
                            <span class="badge bg-primary me-2">{tech.name}</span>
                            <span class="small text-muted">{tech.description}</span>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</section>

<!-- Statistics Section -->
<section class="mb-5">
    <div class="card bg-body-tertiary">
        <div class="card-body text-center">
            <h3 class="h5 mb-4">Project Statistics</h3>
            <div class="row">
                <div class="col-6 col-md-3">
                    <div class="stat-box">
                        <div class="stat-number h3 text-primary">9+</div>
                        <div class="stat-label small text-muted">Active Tools</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="stat-box">
                        <div class="stat-number h3 text-success">3</div>
                        <div class="stat-label small text-muted">Categories</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="stat-box">
                        <div class="stat-number h3 text-info">100%</div>
                        <div class="stat-label small text-muted">Open Source</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="stat-box">
                        <div class="stat-number h3 text-warning">0</div>
                        <div class="stat-label small text-muted">Data Collected</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Contact Section -->
<section class="mb-5">
    <div class="card">
        <div class="card-body">
            <h3 class="h5 mb-3">
                <i class="bi bi-envelope me-2"></i>
                Get in Touch
            </h3>
            <div class="row">
                <div class="col-md-6">
                    <h6 class="fw-bold">Feedback & Suggestions</h6>
                    <p class="small text-muted mb-3">
                        Have ideas for new tools or improvements? We'd love to hear from you! 
                        Your feedback helps us build better tools for everyone.
                    </p>
                </div>
                <div class="col-md-6">
                    <h6 class="fw-bold">Report Issues</h6>
                    <p class="small text-muted mb-3">
                        Found a bug or having trouble with a tool? Let us know so we can 
                        fix it quickly and improve the experience for all users.
                    </p>
                </div>
            </div>
            <div class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                <strong>Contributing:</strong> Interested in contributing? This project is open source 
                and welcomes contributions from developers of all skill levels.
            </div>
        </div>
    </div>
</section>

<!-- Future Plans -->
<section class="mb-5">
    <div class="card">
        <div class="card-body">
            <h3 class="h5 mb-3">
                <i class="bi bi-rocket me-2"></i>
                Recently Added
            </h3>
            <div class="row">
                <div class="col-md-6">
                    <h6 class="fw-bold">Tools</h6>
                    <ul class="list-unstyled small">
                        <li class="mb-1">• {tools.length} tools in {categories.length} categories</li>
                        <li class="mb-1">• AI and vibe coding helpers: AGENTS.md generator, prompt library, repo packer</li>
                        <li class="mb-1">• Developer utilities: JWT, regex, YAML/TOML, cron, subnets</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6 class="fw-bold">Experience</h6>
                    <ul class="list-unstyled small">
                        <li class="mb-1">• Command palette (Ctrl+K) and search everywhere</li>
                        <li class="mb-1">• Light, dark and automatic themes</li>
                        <li class="mb-1">• Recently used tools and related tool suggestions</li>
                    </ul>
                </div>
            </div>
            <p class="small text-body-secondary mt-3 mb-0">Missing something? <a href={resolve("/contact/")}>Tell us</a>.</p>
        </div>
    </div>
</section>

<style>
    .feature-icon {
        width: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .team-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--bs-tertiary-bg);
        color: var(--bs-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
    }

    .stat-box {
        padding: 1rem;
    }

    .stat-number {
        font-weight: bold;
        margin-bottom: 0.25rem;
    }

    .stat-label {
        font-size: 0.875rem;
    }
</style>
