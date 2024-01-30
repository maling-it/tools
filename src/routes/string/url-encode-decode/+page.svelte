<script>
    let text ='';
    function handleEncode() {
        text = encodeURIComponent(text);
    }

    function handleDecode() {
        text = decodeURIComponent(text);
    }
</script>

<svelte:head>
    <title>URL Encode/Decode Tool</title>
</svelte:head>

<h1>URL Encode/Decode Tool</h1>
<div>
    <label for="example-textarea-1" class="form-label">Description</label>
    <textarea bind:value={text} class="form-control" id="example-textarea-1" rows="6" placeholder="Enter your URL here"></textarea>
</div>
<button class="btn btn-primary" type="button" on:click={handleEncode}>Encode</button>
<button class="btn btn-primary" type="button" on:click={handleDecode}>Decode</button>