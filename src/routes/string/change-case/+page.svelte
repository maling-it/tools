<script>
    let text = '';

    function handleUppercase() {
        text = text.toUpperCase();
    }

    function handleLowercase() {
        text = text.toLowerCase();
    }

    function handleTitleCase() {
        text = text.toLowerCase().replace(/(^|\s)\S/g, function(initial) { return initial.toUpperCase(); });
    }
</script>

<svelte:head>
    <title>Change Case Tool</title>
</svelte:head>

<h1>Change Case Tool</h1>
<div>
    <label for="example-textarea-1" class="form-label">Description</label>
    <textarea bind:value={text} class="form-control" id="example-textarea-1" rows="6" placeholder="Enter your text here"></textarea>
    <button class="btn btn-primary" type="button" on:click={handleUppercase}>Uppercase</button>
    <button class="btn btn-primary" type="button" on:click={handleLowercase}>Lowercase</button>
    <button class="btn btn-primary" type="button" on:click={handleTitleCase}>Title Case</button>
</div>