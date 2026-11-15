<script>
    import { goto, afterNavigate } from "$app/navigation";
    import { resolve } from "$app/paths";
    import { tick } from "svelte";
    import { categories, tools } from "#lib/tools.js";
    import { getRecent, searchTools } from "#lib/search.js";
    import { favorites } from "#lib/favorites.svelte.js";
    import { announce } from "#lib/announce.svelte.js";

    let open = $state(false);
    let query = $state("");
    let selected = $state(0);
    let input = $state();
    let list = $state();
    let recent = $state([]);
    // The element that had focus before the palette opened, so focus can go back there when it closes.
    let opener = null;

    const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? id;

    const results = $derived.by(() => {
        if (query.trim() === "") {
            // Favorites first, then recently used tools without repeating the favorites.
            const paths = [...new Set([...favorites.list, ...recent])];
            const known = paths.map((path) => tools.find((t) => t.path === path)).filter(Boolean);
            return known.length ? known : tools.slice(0, 10);
        }
        return searchTools(tools, query, 12);
    });

    const activeId = $derived(results[selected] ? `palette-option-${selected}` : undefined);

    const show = async () => {
        opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        recent = getRecent();
        query = "";
        selected = 0;
        open = true;
        await tick();
        input?.focus();
    };

    const close = ({ restoreFocus = false } = {}) => {
        open = false;
        if (restoreFocus) tick().then(() => opener?.isConnected && opener.focus());
    };

    const choose = (tool) => {
        close();
        goto(resolve(`${tool.path}/`));
    };

    // Tell screen reader users how many results the search found (after a short pause, so typing is not interrupted).
    $effect(() => {
        if (!open) return;
        const [count, text] = [results.length, query.trim()];
        const timer = setTimeout(() => {
            if (text === "") return;
            announce(count === 0 ? `No tools match ${text}` : `${count} ${count === 1 ? "result" : "results"} available, use the arrow keys to move`);
        }, 400);
        return () => clearTimeout(timer);
    });

    const scrollSelectedIntoView = async () => {
        await tick();
        list?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    };

    const onWindowKeydown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            open ? close({ restoreFocus: true }) : show();
        }
    };

    const onInputKeydown = (event) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            selected = Math.min(selected + 1, results.length - 1);
            scrollSelectedIntoView();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            selected = Math.max(selected - 1, 0);
            scrollSelectedIntoView();
        } else if (event.key === "Enter" && results[selected]) {
            event.preventDefault();
            choose(results[selected]);
        } else if (event.key === "Home" && results.length) {
            event.preventDefault();
            selected = 0;
            scrollSelectedIntoView();
        } else if (event.key === "End" && results.length) {
            event.preventDefault();
            selected = results.length - 1;
            scrollSelectedIntoView();
        } else if (event.key === "Tab") {
            // The dialog has one focusable control, so keep focus inside it.
            event.preventDefault();
        } else if (event.key === "Escape") {
            event.preventDefault();
            close({ restoreFocus: true });
        }
    };

    afterNavigate(close);

    // Exposed so the navbar button can open the palette.
    export { show };
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#if open}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <div class="palette-backdrop" onclick={() => close({ restoreFocus: true })}></div>
    <div class="palette card shadow-lg" role="dialog" aria-modal="true" aria-label="Search tools">
        <div class="p-2 border-bottom d-flex align-items-center gap-2">
            <i class="bi bi-search ms-2 text-body-secondary" aria-hidden="true"></i>
            <input
                bind:this={input}
                bind:value={query}
                class="form-control border-0 shadow-none"
                type="text"
                placeholder="Search {tools.length} tools..."
                aria-label="Search tools"
                role="combobox"
                aria-haspopup="listbox"
                aria-autocomplete="list"
                aria-expanded="true"
                aria-controls="palette-results"
                aria-activedescendant={activeId}
                autocomplete="off"
                spellcheck="false"
                oninput={() => (selected = 0)}
                onkeydown={onInputKeydown}
            />
            <kbd class="me-2" aria-hidden="true">Esc</kbd>
        </div>
        {#if query.trim() === "" && (recent.length || favorites.list.length)}
            <div id="palette-heading" class="small text-body-secondary px-3 pt-2">{favorites.list.length ? "Favorites and recent" : "Recent"}</div>
        {/if}
        <ul
            id="palette-results"
            class="list-unstyled m-0 p-2 palette-results"
            role="listbox"
            aria-label={query.trim() === "" ? "Suggested tools" : "Search results"}
            bind:this={list}
        >
            {#each results as tool, index (tool.path)}
                <!-- Keyboard use goes through the search field (aria-activedescendant), so the options only need a click handler. -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <li
                    id="palette-option-{index}"
                    class="palette-item d-flex align-items-center gap-3"
                    class:active={index === selected}
                    role="option"
                    aria-selected={index === selected}
                    onmousemove={() => (selected = index)}
                    onclick={() => choose(tool)}
                >
                    <i class="bi bi-{tool.icon} fs-5 flex-shrink-0" aria-hidden="true"></i>
                    <span class="flex-grow-1 text-truncate">
                        <span class="d-block fw-semibold">{tool.title}{#if favorites.has(tool.path)} <i class="bi bi-star-fill small" role="img" aria-label="Favorite"></i>{/if}</span>
                        <span class="d-block small text-truncate palette-desc">{tool.description}</span>
                    </span>
                    <span class="badge bg-body-secondary text-body-secondary fw-normal d-none d-sm-inline">{categoryName(tool.category)}</span>
                </li>
            {:else}
                <li class="p-3 text-body-secondary" role="presentation">No tools match "{query}".</li>
            {/each}
        </ul>
        <div class="px-3 py-2 border-top small text-body-secondary d-none d-sm-flex gap-3" aria-hidden="true">
            <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
            <span><kbd>Enter</kbd> open</span>
            <span><kbd>Ctrl</kbd> <kbd>K</kbd> toggle</span>
        </div>
    </div>
{/if}

<style>
    .palette-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1999;
        background: rgba(0, 0, 0, 0.45);
    }

    .palette {
        position: fixed;
        z-index: 2000;
        top: 12vh;
        left: 50%;
        transform: translateX(-50%);
        width: min(40rem, calc(100vw - 1.5rem));
    }

    .palette-results {
        max-height: 55vh;
        overflow-y: auto;
    }

    .palette-item {
        border-radius: var(--bs-border-radius);
        background: transparent;
        color: var(--bs-body-color);
        padding: 0.5rem 0.75rem;
        cursor: pointer;
    }

    /* The highlighted option: a tinted background and a bar, not light text on the accent color, so contrast holds in every style. */
    .palette-item.active {
        background: var(--bs-primary-bg-subtle);
        box-shadow: inset 4px 0 0 var(--bs-primary);
    }

    .palette-desc {
        color: var(--bs-secondary-color);
    }
</style>
