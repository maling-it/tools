<script>
    import ThemeSwitcher from "./ThemeSwitcher.svelte";
    import SidebarLink from "./SidebarLink.svelte";
    import { base } from "$app/paths";
    export let links = [
        { name: "Getting started", divider: true },
        { name: "About", url: "/about" },
        { name: "Contact", url: "/contact" },
        { name: "String Utility", divider: true, icon: "regex" },
        { name: "HTML Escape", url: "/string/html-escape" },
        { name: "Javasript Escape", url: "/string/js-escape-unescape" },
        { name: "XML Escape", url: "/string/xml-escape-unescape" },
        { name: "URL Encode | Decode", url: "/string/url-encode-decode" },
        { name: "Change Case", url: "/string/change-case" },
        { name: "Replace Text", url: "/string/replace-text" },
        { name: "Word Count", url: "/string/word-counter" },
        { name: "Converter", divider: true, icon: "arrow-left-right" },
        { name: "CSV To JSON", url: "/converter/csv-to-json" },
        { name: "Van Ophuijsen Indonesian", url: "/converter/before-eyd" },
        { name: "Testing", divider: true, icon: "upc" },
        { name: "Telegram", url: "/testing/telegram"},

    ];
</script>

<nav
    class="sidebar offcanvas-start offcanvas-md"
    tabindex="-1"
    id="sidebar"
>
    <div
        class="offcanvas-header border-bottom border-secondary border-opacity-25"
    >
    <a href="{base}/" class="sidebar-brand d-flex align-items-center me-auto">
        <img src="{base}/favicon.png" alt="Logo" width="28" height="28" class="d-block flex-shrink-0 me-1">
        Mools
    </a>
        <span class="d-none d-md-inline-block">
            <ThemeSwitcher />
        </span>
        <button
            type="button"
            class="btn-close d-md-none"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
            data-bs-target="#sidebar"
        />
    </div>
    <div class="offcanvas-body">
        <div class="mt-2 mb-3">
            <input type="text" class="form-control" placeholder="Search" />
        </div>
        <SidebarLink {links} />
    </div>
</nav>
