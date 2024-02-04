<script>
    import ThemeSwitcher from "./ThemeSwitcher.svelte";
    import CoreSwitcher from "./CoreSwitcher.svelte";
    import { page } from "$app/stores";
    import { base } from "$app/paths";
    import { onMount } from "svelte";

    let repoData;

    onMount(async () => {
        try {
            const response = await fetch(
                "https://api.github.com/repos/maling-it/tools",
            );
            const data = await response.json();
            repoData = data;
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });
</script>

<nav class="navbar navbar-expand-md mools-navbar sticky-top">
    <div class="container-md px-3 px-sm-4 px-xl-5 py-1 justify-content-start">
        <div class="btn-group me-3 d-lg-none">
            <button
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#sidebar"
                class="btn btn-secondary btn-square"
                aria-label="Toggle sidebar"
            >
                <i class="bi bi-layout-sidebar" aria-hidden="true" />
            </button>

            <ThemeSwitcher />
        </div>
        <a
            href="/"
            class="navbar-brand d-flex align-items-center d-lg-none ms-auto ms-md-0"
        >
            <img
                src="{base}/favicon.png"
                alt="Logo"
                width="28"
                height="28"
                class="d-block flex-shrink-0 me-1"
            />
            Mools
        </a>
        <div
            class="d-none d-lg-block text-truncate"
            style="color: hsla(var(--bs-emphasis-color-hsl), 0.7); letter-spacing: 1px;"
        >
            {base}{$page.route.id}
        </div>
        <div class="btn-group ms-auto d-md-none">
            <div class="btn-group">
                <CoreSwitcher />
            </div>
            <button
                class="btn btn-secondary btn-square"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#mools-navbar-collapse"
                aria-controls="mools-navbar-collapse"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <i class="bi bi-list" aria-hidden="true" />
            </button>
        </div>
        <div class="collapse navbar-collapse" id="mools-navbar-collapse">
            <div class="navbar-nav ms-auto "></div>
            <div
                class="d-flex align-items-center justify-content-center"
            >
                <div class="dropdown me-2 d-none d-md-inline-block">
                    <CoreSwitcher />
                </div>
                <div class="btn-group p-1 me-1">
                    {#if repoData}
                        <a
                            href={repoData.html_url}
                            class="btn btn-secondary flex-grow-1 d-flex align-items-center flex-nowrap text-start"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <i
                                class="bi bi-github flex-shrink-0"
                                style="width: 20px;"
                                aria-hidden="true"
                            />
                            Star
                        </a>
                        <a
                            href=" {repoData.html_url}/stargazers"
                            class="btn btn-secondary flex-grow-1 text-nowrap"
                            id="github-stars-count"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {repoData.stargazers_count}</a
                        >
                    {:else}
                        Loading
                    {/if}
                </div>
            </div>
        </div>
    </div>
</nav>
