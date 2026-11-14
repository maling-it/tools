<script>
    import { onMount } from "svelte";
    import { memoryDeck } from "#lib/games.js";

    let deck = $state([]);
    let flipped = $state([]);
    let matched = $state([]);
    let moves = $state(0);
    let locked = false;

    const newGame = () => {
        deck = memoryDeck();
        flipped = [];
        matched = [];
        moves = 0;
        locked = false;
    };

    onMount(newGame);

    const won = $derived(deck.length > 0 && matched.length === deck.length);

    const flip = (card) => {
        if (locked || flipped.includes(card.id) || matched.includes(card.id)) return;
        flipped.push(card.id);
        if (flipped.length < 2) return;

        moves++;
        const [first, second] = flipped.map((id) => deck.find((c) => c.id === id));
        if (first.symbol === second.symbol) {
            matched.push(first.id, second.id);
            flipped = [];
        } else {
            locked = true;
            setTimeout(() => {
                flipped = [];
                locked = false;
            }, 800);
        }
    };
</script>

<svelte:head>
    <title>Memory Match | Mools</title>
</svelte:head>

<h1>Memory Match</h1>
<p class="text-body-secondary mb-3">Flip cards to find all the matching pairs in as few moves as you can.</p>

<div class="mx-auto text-center" style="max-width: 24rem;">
    <div class="grid mb-3">
        {#each deck as card (card.id)}
            {@const open = flipped.includes(card.id) || matched.includes(card.id)}
            <button
                class="card-btn"
                class:open
                class:done={matched.includes(card.id)}
                type="button"
                aria-label={open ? card.symbol : "Hidden card"}
                onclick={() => flip(card)}
            >{open ? card.symbol : ""}</button>
        {/each}
    </div>

    <p class="fw-semibold" aria-live="polite">
        {#if won}You matched all pairs in {moves} moves!{:else}Moves: {moves}{/if}
    </p>
    <button class="btn btn-primary" type="button" onclick={newGame}>New game</button>
</div>

<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
    }

    .card-btn {
        aspect-ratio: 1;
        font-size: 2rem;
        border: 2px solid var(--bs-border-color);
        border-radius: 8px;
        background: var(--bs-primary-bg-subtle);
        color: var(--bs-body-color);
        transition: background 0.15s ease;
    }

    .card-btn.open {
        background: var(--bs-body-bg);
    }

    .card-btn.done {
        background: var(--bs-success-bg-subtle);
        border-color: var(--bs-success);
    }
</style>
