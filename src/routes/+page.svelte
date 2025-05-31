<script>
    import { base } from '$app/paths'
    
    const featuredTools = [
        {
            title: "Text Case Converter",
            description: "Convert text between uppercase, lowercase, and title case",
            icon: "bi-type",
            link: `${base}/string/change-case`,
            category: "String"
        },
        {
            title: "HTML Escape/Unescape",
            description: "Safely encode or decode HTML entities",
            icon: "bi-code-slash",
            link: `${base}/string/html-escape`,
            category: "String"
        },
        {
            title: "Word Counter",
            description: "Count words, characters, and analyze text statistics",
            icon: "bi-calculator",
            link: `${base}/string/word-counter`,
            category: "String"
        },
        {
            title: "URL Encode/Decode",
            description: "Encode or decode URLs for safe transmission",
            icon: "bi-link-45deg",
            link: `${base}/string/url-encode-decode`,
            category: "String"
        },
        {
            title: "CSV to JSON",
            description: "Convert CSV data to JSON format",
            icon: "bi-arrow-left-right",
            link: `${base}/converter/csv-to-json`,
            category: "Converter"
        },
        {
            title: "Telegram Bot Tester",
            description: "Test your Telegram bot with messages, photos, and documents",
            icon: "bi-chat-dots",
            link: `${base}/testing/telegram`,
            category: "Testing"
        }
    ];

    const categories = [
        {
            name: "String Tools",
            description: "Text manipulation and processing utilities",
            icon: "bi-type",
            link: `${base}/string`,
            tools: 6
        },
        {
            name: "Converters",
            description: "Format conversion and transformation tools",
            icon: "bi-arrow-repeat",
            link: `${base}/converter`,
            tools: 2
        },
        {
            name: "Testing Tools",
            description: "API testing and debugging utilities",
            icon: "bi-bug",
            link: `${base}/testing`,
            tools: 1
        }
    ];
</script>

<svelte:head>
    <title>Mools - Online Developer Tools</title>
    <meta name="description" content="Collection of useful online tools for developers including text processors, converters, and testing utilities.">
</svelte:head>

<!-- Hero Section -->
<div class="hero-section text-center mb-5">
    <div class="d-flex justify-content-center align-items-center mb-3">
        <img src="{base}/favicon.png" width="80" class="me-3" alt="Mools Logo">
        <h1 class="display-4 mb-0">Mools</h1>
    </div>
    <p class="lead text-muted mb-4">
        A collection of useful online tools for developers and power users
    </p>
    <p class="text-muted">
        No registration required • Fast and secure • Works offline
    </p>
</div>

<!-- Featured Tools -->
<section class="mb-5">
    <h2 class="h4 mb-3">
        <i class="bi bi-star me-2"></i>
        Featured Tools
    </h2>
    <div class="row g-3">
        {#each featuredTools as tool}
            <div class="col-md-6 col-lg-4">
                <a href={tool.link} class="text-decoration-none">
                    <div class="card h-100 tool-card">
                        <div class="card-body">
                            <div class="d-flex align-items-start mb-3">
                                <div class="tool-icon me-3">
                                    <i class="{tool.icon} fs-4"></i>
                                </div>
                                <div class="flex-grow-1">
                                    <h5 class="card-title mb-1">{tool.title}</h5>
                                    <span class="badge bg-secondary mb-2">{tool.category}</span>
                                </div>
                            </div>
                            <p class="card-text text-muted small">{tool.description}</p>
                        </div>
                    </div>
                </a>
            </div>
        {/each}
    </div>
</section>

<!-- Categories -->
<section class="mb-5">
    <h2 class="h4 mb-3">
        <i class="bi bi-grid me-2"></i>
        Tool Categories
    </h2>
    <div class="row g-3">
        {#each categories as category}
            <div class="col-md-4">
                <a href={category.link} class="text-decoration-none">
                    <div class="card category-card h-100">
                        <div class="card-body text-center">
                            <div class="category-icon mb-3">
                                <i class="{category.icon} fs-1"></i>
                            </div>
                            <h5 class="card-title">{category.name}</h5>
                            <p class="card-text text-muted small mb-2">{category.description}</p>
                            <span class="badge bg-primary">{category.tools} tools</span>
                        </div>
                    </div>
                </a>
            </div>
        {/each}
    </div>
</section>

<!-- About Section -->
<section class="mb-5">
    <div class="card">
        <div class="card-body">
            <h3 class="h5 mb-3">
                <i class="bi bi-info-circle me-2"></i>
                About Mools
            </h3>
            <div class="row">
                <div class="col-md-8">
                    <p class="mb-3">
                        Mools is a collection of useful online tools designed for developers, content creators, 
                        and anyone who works with text and data. All tools run entirely in your browser, 
                        ensuring your data stays private and secure.
                    </p>
                    <div class="row">
                        <div class="col-sm-6">
                            <h6 class="fw-bold">
                                <i class="bi bi-shield-check text-success me-2"></i>
                                Privacy First
                            </h6>
                            <p class="small text-muted">All processing happens locally in your browser</p>
                        </div>
                        <div class="col-sm-6">
                            <h6 class="fw-bold">
                                <i class="bi bi-lightning text-warning me-2"></i>
                                Fast & Lightweight
                            </h6>
                            <p class="small text-muted">Optimized for speed and efficiency</p>
                        </div>
                        <div class="col-sm-6">
                            <h6 class="fw-bold">
                                <i class="bi bi-phone text-primary me-2"></i>
                                Mobile Friendly
                            </h6>
                            <p class="small text-muted">Works perfectly on all devices</p>
                        </div>
                        <div class="col-sm-6">
                            <h6 class="fw-bold">
                                <i class="bi bi-code-square text-info me-2"></i>
                                Open Source
                            </h6>
                            <p class="small text-muted">Built with modern web technologies</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 text-center">
                    <div class="stats-box">
                        <div class="stat-item mb-3">
                            <div class="stat-number h3 mb-0">9+</div>
                            <div class="stat-label text-muted small">Tools Available</div>
                        </div>
                        <div class="stat-item mb-3">
                            <div class="stat-number h3 mb-0">3</div>
                            <div class="stat-label text-muted small">Categories</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number h3 mb-0">100%</div>
                            <div class="stat-label text-muted small">Free to Use</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<style>
    .hero-section {
        padding: 2rem 0;
    }

    .tool-card, .category-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        border: 1px solid var(--bs-border-color);
    }

    .tool-card:hover, .category-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

    .category-icon {
        width: 80px;
        height: 80px;
        border-radius: 16px;
        background: var(--bs-light);
        color: var(--bs-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
    }

    .stats-box {
        background: var(--bs-light);
        border-radius: 12px;
        padding: 1.5rem;
    }

    .stat-number {
        color: var(--bs-primary);
        font-weight: bold;
    }

    a:hover .card {
        text-decoration: none;
    }

    @media (max-width: 768px) {
        .hero-section {
            padding: 1rem 0;
        }
        
        .display-4 {
            font-size: 2rem;
        }
    }
</style>