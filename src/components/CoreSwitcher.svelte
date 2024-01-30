<script>
    import { onMount } from "svelte";

    const setStoredCore = (core) => localStorage.setItem("core", core);

    const getPreferredCore = () => {
        const storedCore = getStoredCore();
        if (storedCore) {
            return storedCore;
        }

        return "default";
    };

    const setCore = (core) => {
        document.documentElement.setAttribute("data-bs-core", core);
        setStoredCore(core);
    };

    const showActiveCore = (core) => {
        const coreSwitcher = document.querySelector("#bd-core");

        if (!coreSwitcher) {
            return;
        }

        const btnToActive = coreSwitcher.querySelector(
            `[data-bs-core-value="${core}"]`
        );

        if (!btnToActive) {
            return;
        }

        document.querySelectorAll("[data-bs-core-value]").forEach((element) => {
            element.classList.remove("active");
            element.setAttribute("aria-pressed", "false");
        });

        btnToActive.classList.add("active");
        btnToActive.setAttribute("aria-pressed", "true");
    };

    const getStoredCore = () => localStorage.getItem("core");

    onMount(() => {
        setCore(getPreferredCore());

        showActiveCore(getPreferredCore());

        document.querySelectorAll("[data-bs-core-value]").forEach((toggle) => {
            toggle.addEventListener("click", () => {
                const core = toggle.getAttribute("data-bs-core-value");
                setStoredCore(core);
                setCore(core);
                showActiveCore(core);
            });
        });
    });
</script>

<div class="dropdown me-2">
    <button
        type="button"
        class="btn btn-secondary flex-grow-1 d-flex align-items-center flex-nowrap text-start position-relative"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        data-bs-auto-close="outside"
    >
        <i class="bi bi-brush flex-shrink-0" style="width: 22px;" />
        Theme
    </button>
    <div
        class="core-picker-dropdown-menu dropdown-menu dropdown-menu-end p-0"
        style="width: 20rem;"
    >
        <div class="p-2">
            <div class="container-fluid g-0">
                <div class="row g-2">
                    <div class="core-theme-button col-12">
                        <input
                            type="radio"
                            name="core-picker-2"
                            value="default"
                            class="btn-check"
                            id="default-core-2"
                            autocomplete="off"
                            on:change={() => setCore("default")}
                            checked
                        />
                        <label
                            class="btn text-start d-block w-100 py-2 px-3"
                            for="default-core-2"
                        >
                            <span class="d-flex align-items-center">
                                <i
                                    class="bi bi-newspaper specific-w-sm-25 flex-shrink-0"
                                    style="width: 20px;"
                                />
                                Default
                            </span>
                            <span
                                class="d-block mt-1"
                                style="font-size: var(--bs-font-size-sm); opacity: 0.85;"
                            >
                                Classic, inspired by Apple HID.
                            </span>
                        </label>
                    </div>
                    <div class="core-theme-button col-12">
                        <input
                            type="radio"
                            name="core-picker-2"
                            value="modern"
                            class="btn-check"
                            id="modern-core-2"
                            autocomplete="off"
                            on:change={() => setCore("modern")}
                        />
                        <label
                            class="btn text-start d-block w-100 py-2 px-3"
                            for="modern-core-2"
                        >
                            <span class="d-flex align-items-center">
                                <i
                                    class="bi bi-layout-wtf specific-w-sm-25 flex-shrink-0"
                                    style="width: 20px;"
                                />
                                Modern
                            </span>
                            <span
                                class="d-block mt-1"
                                style="font-size: var(--bs-font-size-sm); opacity: 0.85;"
                            >
                                Like default, but with slightly more modern
                                design sensibilities, particularly in dark mode.
                            </span>
                        </label>
                    </div>
                    <div class="core-theme-button col-12">
                        <input
                            type="radio"
                            name="core-picker-2"
                            value="elegant"
                            class="btn-check"
                            id="elegant-core-2"
                            autocomplete="off"
                            on:change={() => setCore("elegant")}
                        />
                        <label
                            class="btn text-start d-block w-100 py-2 px-3"
                            for="elegant-core-2"
                        >
                            <span class="d-flex align-items-center">
                                <i
                                    class="bi bi-window specific-w-sm-25 flex-shrink-0"
                                    style="width: 20px;"
                                />
                                Elegant
                            </span>
                            <span
                                class="d-block mt-1"
                                style="font-size: var(--bs-font-size-sm); opacity: 0.85;"
                            >
                                Beautiful and classy, almost Tuftian.
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
