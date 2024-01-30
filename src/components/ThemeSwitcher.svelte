<script>
    import { onMount } from "svelte";

    const getStoredTheme = () => localStorage.getItem("theme");
    const setStoredTheme = (theme) => localStorage.setItem("theme", theme);

    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }

        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    };

    const setTheme = (theme) => {
        if (
            theme === "auto" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
            document.documentElement.setAttribute("data-bs-theme", "dark");
        } else {
            document.documentElement.setAttribute("data-bs-theme", theme);
        }
    };

    const toggleTheme = () => {
        const currentTheme = getStoredTheme() || getPreferredTheme();
        const newTheme = currentTheme === "dark" ? "light" : "dark";

        setStoredTheme(newTheme);
        setTheme(newTheme);
    };

    onMount(() => {
        setTheme(getPreferredTheme());

        window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", () => {
                const storedTheme = getStoredTheme();
                if (storedTheme !== "light" && storedTheme !== "dark") {
                    setTheme(getPreferredTheme());
                }
            });
    });
</script>

<button
    type="button"
    class="btn btn-secondary"
    data-bs-auto-close="outside"
    on:click={toggleTheme}
>
    <i class="bi bi-moon" />
</button>
