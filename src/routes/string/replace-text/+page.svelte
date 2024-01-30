<script>
    let text = '';
    let find = '';
    let replaceWith = '';

    function handleReplace() {
        text = text.split(find).join(replaceWith);
    }
</script>

<svelte:head>
    <title>Replace Text Tool</title>
</svelte:head>

<h1>Replace Text Tool</h1>
<div>
    <label for="find-input" class="form-label">Find</label>
    <input type="text" bind:value={find} class="form-control" id="find-input" placeholder="Enter the text you want to replace">

    <label for="replace-input" class="form-label">Replace With</label>
    <input type="text" bind:value={replaceWith} class="form-control" id="replace-input" placeholder="Enter the replacement text">

    <label for="example-textarea-1" class="form-label">Text</label>
    <textarea bind:value={text} class="form-control" id="example-textarea-1" rows="6" placeholder="Enter your text here"></textarea>

    <button class="btn btn-primary" type="button" on:click={handleReplace}>Replace</button>
</div>