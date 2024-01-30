<script>
    let text = "";

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function unescapeHtml(safe) {
        return safe
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'");
    }

    function handleEscape() {
        text = escapeHtml(text);
    }

    function handleUnescape() {
        text = unescapeHtml(text);
    }
</script>

<svelte:head>
    <title>HTML Escape/Unescape Tool</title>
</svelte:head>

<h1>HTML Escape/Unescape Tool</h1>
<div>
    <label for="example-textarea-1" class="form-label">Description</label>
    <textarea
        bind:value={text}
        class="form-control"
        id="example-textarea-1"
        rows="6"
        placeholder="Enter your HTML here"
    ></textarea>
</div>
<button class="btn btn-primary" type="button" on:click={handleEscape}
    >Escape</button
>
<button class="btn btn-primary" type="button" on:click={handleUnescape}
    >Unescape</button
>
