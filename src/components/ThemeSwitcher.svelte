<script>
    import { onMount } from "svelte";

    let theme = $state("dark");

    const readStoredTheme = () => {
        try {
            return localStorage.getItem("theme");
        } catch {
            return null;
        }
    };

    const preferredTheme = () =>
        readStoredTheme() ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

    const applyTheme = (value) => document.documentElement.setAttribute("data-bs-theme", value);

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        try {
            localStorage.setItem("theme", next);
        } catch {
            // Storage can be unavailable (private mode); the choice then only lasts for this visit.
        }
        applyTheme(next);
    };

    onMount(() => {
        applyTheme(preferredTheme());

        // Two switchers exist (sidebar and navbar), so follow the attribute instead of local clicks.
        const observer = new MutationObserver(() => {
            theme = document.documentElement.getAttribute("data-bs-theme") ?? "dark";
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-bs-theme"] });
        theme = document.documentElement.getAttribute("data-bs-theme") ?? "dark";

        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const onSystemChange = () => {
            if (!readStoredTheme()) applyTheme(preferredTheme());
        };
        media.addEventListener("change", onSystemChange);

        return () => {
            observer.disconnect();
            media.removeEventListener("change", onSystemChange);
        };
    });
</script>

<button
    type="button"
    class="btn btn-secondary"
    aria-label="Toggle theme"
    title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    onclick={toggleTheme}
>
    <i class="bi {theme === 'dark' ? 'bi-sun' : 'bi-moon'}"></i>
</button>
