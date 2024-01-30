<script>
    let text ='';

    function escapeXml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    function unescapeXml(safe) {
        return safe
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, "\"")
            .replace(/&apos;/g, "'");
    }

    function handleEscape() {
        text = escapeXml(text);
    }

    function handleUnescape() {
        text = unescapeXml(text);
    }
</script>

<svelte:head>
    <title>XML Escape/Unescape Tool</title>
</svelte:head>

<h1>XML Escape/Unescape Tool</h1>
<div>
    <label for="example-textarea-1" class="form-label">Description</label>
    <textarea bind:value={text} class="form-control" id="example-textarea-1" rows="6" placeholder="Enter your XML here"></textarea>
    <button class="btn btn-primary" type="button" on:click={handleEscape}>Escape</button>
    <button class="btn btn-primary" type="button" on:click={handleUnescape}>Unescape</button>
</div>