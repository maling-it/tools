<script>
    import { resolve } from '$app/paths';

    let { tool, showCategory = false } = $props();
</script>

<a href={resolve(`${tool.path}/`)} class="text-decoration-none">
    <div class="card h-100 tool-card">
        <div class="card-body">
            <div class="d-flex align-items-start mb-3">
                <div class="tool-icon me-3 flex-shrink-0">
                    <i class="bi bi-{tool.icon} fs-4"></i>
                </div>
                <div class="flex-grow-1">
                    <h5 class="card-title mb-1">{tool.title}</h5>
                    {#if showCategory}
                        <span class="badge bg-secondary">{tool.category}</span>
                    {/if}
                </div>
            </div>
            <p class="card-text text-body-secondary small mb-3">{tool.description}</p>
            <div>
                {#each (tool.features ?? []) as feature (feature)}
                    <span class="badge bg-body-secondary text-body-secondary fw-normal me-1 mb-1">{feature}</span>
                {/each}
            </div>
        </div>
    </div>
</a>

<style>
    .tool-card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .tool-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
</style>
