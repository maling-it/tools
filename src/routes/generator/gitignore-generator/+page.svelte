<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { GITIGNORE_TEMPLATES, buildGitignore } from "#lib/backlog.js";

    const names = Object.keys(GITIGNORE_TEMPLATES).join(", ");
</script>

<ConvertPage
    title=".gitignore Generator"
    description={`Name your languages, editors and systems and get a .gitignore. Available: ${names}.`}
    label="Templates"
    placeholder="node, macos, vscode"
    rows={2}
    convert={buildGitignore}
    outputTitle=".gitignore"
    filename=".gitignore"
/>
