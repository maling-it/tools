<script>
    import { base } from '$app/paths';

    const converterTools = [
        {
            title: "CSV to JSON",
            description: "Convert CSV data to JSON format for API consumption and data processing",
            icon: "bi-arrow-left-right",
            link: `${base}/converter/csv-to-json`,
            features: ["CSV Import", "JSON Export", "Data Validation"]
        },
        {
            title: "Indonesian Spelling Converter",
            description: "Convert modern Indonesian spelling to pre-EYD (old spelling) format",
            icon: "bi-translate",
            link: `${base}/converter/before-eyd`,
            features: ["Spelling Conversion", "Historical Text", "Indonesian Language"]
        }
    ];

    const comingSoonTools = [
        {
            title: "JSON to CSV",
            description: "Convert JSON data to CSV format for spreadsheet applications",
            icon: "bi-file-earmark-spreadsheet",
            features: ["JSON Import", "CSV Export", "Spreadsheet Ready"]
        },
        {
            title: "Base64 Encoder/Decoder",
            description: "Encode and decode Base64 strings for data transmission",
            icon: "bi-file-binary",
            features: ["Base64 Encoding", "Base64 Decoding", "File Support"]
        },
        {
            title: "Markdown to HTML",
            description: "Convert Markdown text to clean HTML markup",
            icon: "bi-markdown",
            features: ["Markdown Parser", "HTML Output", "Live Preview"]
        }
    ];
</script>

<svelte:head>
    <title>Converter Tools - Format Conversion Utilities</title>
    <meta name="description" content="Data format conversion tools including CSV to JSON, text encoding, and more conversion utilities.">
</svelte:head>

<!-- Header Section -->
<div class="d-flex align-items-center mb-4">
    <div class="category-icon-large me-3">
        <i class="bi bi-arrow-repeat fs-1"></i>
    </div>
    <div>
        <h1 class="mb-2">Converter Tools</h1>
        <p class="text-muted mb-0">Format conversion and data transformation utilities</p>
    </div>
</div>

<!-- Available Tools -->
<section class="mb-5">
    <h2 class="h4 mb-3">Available Tools</h2>
    <div class="row g-4">
        {#each converterTools as tool}
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