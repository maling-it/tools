<script>
    let text = '';
    let totalWords = 0;
    let uniqueWords = 0;
    let totalLines = 0;
    let totalCharacters = 0;
    let totalCharactersNoSpaces = 0;

    function handleCount() {
        totalWords = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        uniqueWords = [...new Set(text.toLowerCase().match(/\b\w+\b/g) || [])].length;
        totalLines = text.split('\n').length;
        totalCharacters = text.length;
        totalCharactersNoSpaces = text.replace(/\s/g, '').length;
    }
</script>

<svelte:head>
    <title>Text Statistics Tool</title>
</svelte:head>

<h1>Text Statistics Tool</h1>
<div>
    <label for="example-textarea-1" class="form-label">Text</label>
    <textarea bind:value={text} class="form-control" id="example-textarea-1" rows="6" placeholder="Enter your text here" on:input={handleCount}></textarea>
</div>
<p>{totalWords} words, {uniqueWords} unique words</p>
<p>{totalLines} lines</p>
<p>{totalCharacters} characters, {totalCharactersNoSpaces} characters (excluding spaces)</p>