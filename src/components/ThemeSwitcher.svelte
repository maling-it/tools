<script>
    import { onMount } from "svelte";

    const modes = [
        { id: "light", name: "Light", icon: "sun" },
        { id: "dark", name: "Dark", icon: "moon-stars" },
        { id: "auto", name: "Auto", icon: "circle-half" }
    ];

    // Which edge of the button the menu aligns to; use "start" when the button sits at the left of the screen.
    let { align = "end" } = $props();

    let mode = $state("auto");

    const readStoredMode = () => {
        try {
            const stored = localStorage.getItem("theme");
            return modes.some((m) => m.id === stored) ? stored : "auto";
        } catch {
            return "auto";
        }
    };

    const resolve = (value) =>
        value === "auto" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : value;

    // The mode is kept on <html> so the two switchers (sidebar and navbar) always agree.
    const apply = (value) => {
        document.documentElement.setAttribute("data-bs-theme", resolve(value));
        document.documentElement.setAttribute("data-theme-mode", value);
    };

    const select = (value) => {
        try {
            localStorage.setItem("theme", value);
        } catch {
            // Storage can be unavailable (private mode); the choice then only lasts for this visit.
        }
        apply(value);
    };

    onMount(() => {
        apply(readStoredMode());
        mode = document.documentElement.getAttribute("data-theme-mode") ?? "auto";

        const observer = new MutationObserver(() => {
            mode = document.documentElement.getAttribute("data-theme-mode") ?? "auto";
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme-mode"] });

        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const onSystemChange = () => {
            if (readStoredMode() === "auto") apply("auto");
        };
        media.addEventListener("change", onSystemChange);

        return () => {
            observer.disconnect();
            media.removeEventListener("change", onSystemChange);
        };
    });

    const current = $derived(modes.find((m) => m.id === mode) ?? modes[2]);
</script>

<div class="dropdown">
    <button
        type="button"
        class="btn btn-secondary"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="Choose theme, currently {current.name}"
        title="Theme: {current.name}"
    >
        <i class="bi bi-{current.icon}"></i>
    </button>
    <ul class="dropdown-menu dropdown-menu-{align}">
        {#each modes as option (option.id)}
            <li>
                <button
                    type="button"
                    class="dropdown-item d-flex align-items-center"
                    class:active={mode === option.id}
                    aria-pressed={mode === option.id}
                    onclick={() => select(option.id)}
                >
                    <i class="bi bi-{option.icon} me-2"></i>
                    {option.name}
                    {#if mode === option.id}<i class="bi bi-check2 ms-auto ps-3"></i>{/if}
                </button>
            </li>
        {/each}
    </ul>
</div>
