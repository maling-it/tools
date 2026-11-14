<script>
    import "halfmoon/css/halfmoon.min.css";
    import "halfmoon/css/cores/halfmoon.cores.css";
    import "bootstrap-icons/font/bootstrap-icons.css";
    import "../app.css";
    import { onMount } from "svelte";
    import { base } from "#lib/paths.js";
    import Navbar from "../components/Navbar.svelte";
    import Sidebar from "../components/Sidebar.svelte";

    let { children } = $props();

    // Bootstrap's JS powers the offcanvas sidebar and dropdowns; it touches `document`, so load it client-side only.
    onMount(() => {
        import("bootstrap/dist/js/bootstrap.bundle.min.js");
    });
</script>

<svelte:head>
    <link rel="icon" href="{base}/favicon.png" />
</svelte:head>

<Sidebar />
<Navbar />
<div class="container-md px-3 py-4 px-sm-4 px-xl-5">
    {@render children()}
</div>
