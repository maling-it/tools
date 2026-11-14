<script>
    import { onMount } from "svelte";

    let offline = $state(false);
    let waiting = $state();

    const watchRegistration = (registration) => {
        // An update is "ready" once it has installed while an older version still controls the page.
        const check = () => {
            if (registration.waiting && navigator.serviceWorker.controller) waiting = registration.waiting;
        };
        check();
        registration.addEventListener("updatefound", () => {
            registration.installing?.addEventListener("statechange", check);
        });
        // Look for a new version when the tab comes back to the foreground.
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") registration.update().catch(() => {});
        });
    };

    onMount(() => {
        offline = !navigator.onLine;
        const goOnline = () => (offline = false);
        const goOffline = () => (offline = true);
        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);

        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistration().then((registration) => registration && watchRegistration(registration));
            // After the new version takes over, reload once so the page and its files match.
            let reloading = false;
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (reloading || !waiting) return;
                reloading = true;
                location.reload();
            });
        }

        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    });

    const update = () => waiting?.postMessage("SKIP_WAITING");
</script>

<div class="status-stack" aria-live="polite">
    {#if waiting}
        <div class="alert alert-primary shadow d-flex align-items-center gap-3 py-2 mb-2" role="status">
            <span>A new version of Mools is ready.</span>
            <button class="btn btn-primary btn-sm ms-auto" type="button" onclick={update}>Reload</button>
            <button class="btn-close" type="button" aria-label="Dismiss" onclick={() => (waiting = undefined)}></button>
        </div>
    {/if}
    {#if offline}
        <div class="alert alert-warning shadow py-2 mb-2" role="status">
            <i class="bi bi-wifi-off me-1"></i>You are offline. Tools keep working; only the Telegram tester and the star count need a connection.
        </div>
    {/if}
</div>

<style>
    .status-stack {
        position: fixed;
        z-index: 1900;
        left: 0.75rem;
        right: 0.75rem;
        bottom: 0.25rem;
        max-width: 28rem;
        pointer-events: none;
    }

    .status-stack > :global(*) {
        pointer-events: auto;
    }

    @media (min-width: 992px) {
        .status-stack {
            left: calc(var(--bs-sidebar-width, 18rem) + 0.75rem);
        }
    }
</style>
