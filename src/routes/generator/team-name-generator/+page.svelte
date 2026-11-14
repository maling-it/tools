<script>
    import { onMount } from "svelte";
    import ResultList from "../../../components/ResultList.svelte";
    import { teamNames } from "#lib/generators.js";

    let names = $state([]);
    const generate = () => (names = teamNames(10));
    onMount(generate);
</script>

<svelte:head>
    <title>Cool Team Name Generator | Mools</title>
</svelte:head>

<h1>Cool Team Name Generator</h1>
<p class="text-body-secondary mb-3">Get team name ideas for sports, games, quizzes and projects.</p>

<div class="mb-3">
    <button class="btn btn-primary" type="button" onclick={generate}>Generate new names</button>
</div>
<ResultList items={names} title="Team names" />
