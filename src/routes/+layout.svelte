<script>
    import "halfmoon/css/halfmoon.min.css";
    import "halfmoon/css/cores/halfmoon.cores.css";
    import Nav from "../components/Nav.svelte";
    import "bootstrap-icons/font/bootstrap-icons.css";
    import { onMount, afterUpdate } from "svelte";
    import {base} from "$app/paths";
    let loading = true;

    afterUpdate(() => {
        setTimeout(() => {
            loading = false;
        }, 3000);
    });
    onMount(() => {
        const script = document.createElement("script");
        script.src =
            "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js";
        script.integrity =
            "sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL";
        script.crossOrigin = "anonymous";
        document.body.appendChild(script);
    });
</script>
<svelte:head>
    <link rel="icon" href="{base}/favicon.png" />
</svelte:head>
<Nav />
<div class="container-md px-3 px-sm-4 px-xl-5">
    <slot />
</div>
