<script>
    let text = '';

    function escapeJavascript(unsafe) {
        return unsafe
            .replace(/\\/g, "\\\\")
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\//g, '\\/')
            .replace(/</g, '\\x3C')
            .replace(/>/g, '\\x3E')
            .replace(/-/g, '\\-')
            .replace(/;/g, '\\;')
            .replace(/=/g, '\\=')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\[/g, '\\[')
            .replace(/\]/g, '\\]')
            .replace(/\./g, '\\.')
            .replace(/\,/g, '\\,');
    }

    function unescapeJavascript(safe) {
        return safe
            .replace(/\\\\/g, "\\")
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\//g, '/')
            .replace(/\\x3C/g, '<')
            .replace(/\\x3E/g, '>')
            .replace(/\\-/g, '-')
            .replace(/\\;/g, ';')
            .replace(/\\=/g, '=')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\{/g, '{')
            .replace(/\\\}/g, '}')
            .replace(/\\\[/g, '[')
            .replace(/\\\]/g, ']')
            .replace(/\\\./g, '.')
            .replace(/\\,/g, ',');
    }

    function handleEscape() {
        text = escapeJavascript(text);
    }

    function handleUnescape() {
        text = unescapeJavascript(text);
    }
</script>

<svelte:head>
    <title>JavaScript Escape/Unescape Tool</title>
</svelte:head>

<h1>JavaScript Escape/Unescape Tool</h1>
<div>
    <label for="example-textarea-1" class="form-label">Description</label>
    <textarea bind:value={text} class="form-control" id="example-textarea-1" rows="6" placeholder="Enter your JavaScript here"></textarea>
    <button class="btn btn-primary" type="button" on:click={handleEscape}>Escape</button>
    <button class="btn btn-primary" type="button" on:click={handleUnescape}>Unescape</button>
</div>