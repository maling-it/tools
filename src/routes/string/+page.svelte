<script>
    import { base } from '$app/paths';

    const stringTools = [
        {
            title: "Text Case Converter",
            description: "Convert text between uppercase, lowercase, and title case formats",
            icon: "bi-type",
            link: `${base}/string/change-case`,
            features: ["Uppercase", "Lowercase", "Title Case"]
        },
        {
            title: "HTML Escape/Unescape",
            description: "Safely encode or decode HTML entities to prevent XSS attacks",
            icon: "bi-code-slash",
            link: `${base}/string/html-escape`,
            features: ["HTML Encoding", "HTML Decoding", "XSS Prevention"]
        },
        {
            title: "XML Escape/Unescape",
            description: "Escape or unescape XML special characters for safe data transmission",
            icon: "bi-file-earmark-code",
            link: `${base}/string/xml-escape-unescape`,
            features: ["XML Encoding", "XML Decoding", "Safe Data Transfer"]
        },
        {
            title: "JavaScript Escape/Unescape",
            description: "Escape JavaScript strings for safe embedding in code or JSON",
            icon: "bi-braces",
            link: `${base}/string/js-escape-unescape`,
            features: ["JS String Escaping", "JSON Safe", "Code Embedding"]
        },
        {
            title: "URL Encode/Decode",
            description: "Encode or decode URLs for safe transmission over the internet",
            icon: "bi-link-45deg",
            link: `${base}/string/url-encode-decode`,
            features: ["URL Encoding", "URL Decoding", "Web Safe URLs"]
        },
        {
            title: "Word Counter",
            description: "Count words, characters, lines and analyze text statistics",
            icon: "bi-calculator",
            link: `${base}/string/word-counter`,
            features: ["Word Count", "Character Count", "Line Count", "Unique Words"]
        },
        {
            title: "Find & Replace",
            description: "Find and replace text patterns in your content quickly",
            icon: "bi-search",
            link: `${base}/string/replace-text`,
            features: ["Text Search", "Text Replace", "Bulk Editing"]
        }
    ];
</script>

<svelte:head>
    <title>String Tools - Text Processing Utilities</title>
    <meta name="description" content="Collection of string manipulation tools for developers including case converters, escape tools, and text analyzers.">
</svelte:head>

<!-- Header Section -->
<div class="d-flex align-items-center mb-4">
    <div class="category-icon-large me-3">
        <i class="bi bi-type fs-1"></i>
    </div>
    <div>
        <h1 class="mb-2">String Tools</h1>
        <p class="text-muted mb-0">Text manipulation and processing utilities for developers and content creators</p>
    </div>
</div>

<!-- Tools Grid -->
<div class="row g-4">
    {#each stringTools as tool}
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

<!-- Quick Start Guide -->
<section class="mt-5">
    <div class="card">
        <div class="card-body">
            <h3 class="h5 mb-3">
                <i class="bi bi-lightbulb me-2"></i>
                Quick Start Guide
            </h3>
            <div class="row">
                <div class="col-md-6">
                    <h6 class="fw-bold">Most Popular Tools</h6>
                    <ul class="list-unstyled small">
                        <li class="mb-1">• <strong>Word Counter</strong> - Analyze text statistics</li>
                        <li class="mb-1">• <strong>Case Converter</strong> - Change text formatting</li>
                        <li class="mb-1">• <strong>HTML Escape</strong> - Secure web content</li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6 class="fw-bold">Use Cases</h6>
                    <ul class="list-unstyled small">
                        <li class="mb-1">• Web development and debugging</li>
                        <li class="mb-1">• Content creation and editing</li>
                        <li class="mb-1">• Data processing and formatting</li>
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

    .features-list .badge {
        font-size: 0.75rem;
        font-weight: normal;
    }

    a:hover .card {
        text-decoration: none;
    }
</style>