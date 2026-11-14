<script>
    import { onMount } from "svelte";

    const cores = [
        { id: "default", name: "Default", icon: "newspaper", description: "Classic, inspired by Apple HID." },
        {
            id: "modern",
            name: "Modern",
            icon: "layout-wtf",
            description: "Like default, but with slightly more modern design sensibilities, particularly in dark mode."
        },
        { id: "elegant", name: "Elegant", icon: "window", description: "Beautiful and classy, almost Tuftian." }
    ];

    // Two switchers are rendered (navbar and collapsed menu), so ids must be unique per instance.
    const uid = $props.id();

    let selectedCore = $state("default");

    const readStoredCore = () => {
        try {
            return localStorage.getItem("core");
        } catch {
            return null;
        }
    };

    const setCore = (core) => {
        document.documentElement.setAttribute("data-bs-core", core);
        try {
            localStorage.setItem("core", core);
        } catch {
            // Storage can be unavailable (private mode); the choice then only lasts for this visit.
        }
        selectedCore = core;
    };

    onMount(() => {
        setCore(readStoredCore() ?? "default");

        // Follow the attribute so both switchers stay in sync.
        const observer = new MutationObserver(() => {
            selectedCore = document.documentElement.getAttribute("data-bs-core") ?? "default";
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-core"] });
        return () => observer.disconnect();
    });
</script>

<div class="dropdown me-2">
    <button
        type="button"
        class="btn btn-secondary flex-grow-1 d-flex align-items-center flex-nowrap text-start position-relative"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Choose style"
        data-bs-auto-close="outside"
    >
        <i class="bi bi-brush flex-shrink-0"></i>
    </button>
    <div class="core-picker-dropdown-menu dropdown-menu dropdown-menu-end p-0" style="width: 20rem;">
        <div class="p-2">
            <div class="container-fluid g-0">
                <div class="row g-2">
                    {#each cores as core (core.id)}
                        <div class="core-theme-button col-12">
                            <input
                                type="radio"
                                name="core-picker-{uid}"
                                value={core.id}
                                class="btn-check"
                                id="{core.id}-core-{uid}"
                                autocomplete="off"
                                checked={selectedCore === core.id}
                                onchange={() => setCore(core.id)}
                            />
                            <label class="btn text-start d-block w-100 py-2 px-3" for="{core.id}-core-{uid}">
                                <span class="d-flex align-items-center">
                                    <i class="bi bi-{core.icon} flex-shrink-0" style="width: 20px;"></i>
                                    {core.name}
                                </span>
                                <span class="d-block mt-1" style="font-size: var(--bs-font-size-sm); opacity: 0.85;">
                                    {core.description}
                                </span>
                            </label>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
