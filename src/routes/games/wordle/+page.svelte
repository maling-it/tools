<script>
    import { onMount } from "svelte";
    import { ANSWERS, evaluateGuess } from "#lib/games.js";
    import { pick } from "#lib/random.js";

    const LENGTH = 5;
    const TRIES = 6;
    const KEYS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
    // The state of a letter is also written out, so it does not depend on color alone.
    const STATE_TEXT = { correct: "correct position", present: "in the word, wrong position", absent: "not in the word", typing: "typed", empty: "empty" };

    let answer = $state("");
    let guesses = $state([]);
    let current = $state("");
    let message = $state("");

    const results = $derived(guesses.map((guess) => evaluateGuess(guess, answer)));
    const won = $derived(guesses.at(-1) === answer);
    const lost = $derived(!won && guesses.length >= TRIES);
    const over = $derived(won || lost);

    const keyStates = $derived.by(() => {
        const rank = { absent: 1, present: 2, correct: 3 };
        const states = {};
        guesses.forEach((guess, row) => {
            [...guess].forEach((letter, i) => {
                const state = results[row][i];
                if (!states[letter] || rank[state] > rank[states[letter]]) states[letter] = state;
            });
        });
        return states;
    });

    const newGame = () => {
        answer = pick(ANSWERS);
        guesses = [];
        current = "";
        message = "";
    };

    onMount(newGame);

    const press = (key) => {
        if (over || !answer) return;
        message = "";
        if (key === "enter") {
            if (current.length < LENGTH) {
                message = "Not enough letters.";
                return;
            }
            guesses.push(current);
            current = "";
        } else if (key === "backspace") {
            current = current.slice(0, -1);
        } else if (/^[a-z]$/.test(key) && current.length < LENGTH) {
            current += key;
        }
    };

    const onKeydown = (event) => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        const key = event.key.toLowerCase();
        if (key === "enter" || key === "backspace" || /^[a-z]$/.test(key)) {
            if (event.target.tagName === "BUTTON" && key === "enter") return;
            press(key);
        }
    };

    const cell = (row, col) => {
        if (row < guesses.length) return { letter: guesses[row][col], state: results[row][col] };
        if (row === guesses.length) return { letter: current[col] ?? "", state: current[col] ? "typing" : "empty" };
        return { letter: "", state: "empty" };
    };
</script>

<svelte:window onkeydown={onKeydown} />

<svelte:head>
    <title>Wordle | Mools</title>
</svelte:head>

<h1>Wordle</h1>
<p class="text-body-secondary mb-3">Guess the five-letter word in six tries. Green with a ✓ is the right spot, yellow with a ~ is in the word elsewhere, and gray with a ✕ is not in the word. Any five letters are accepted as a guess.</p>

<div class="mx-auto text-center" style="max-width: 24rem;">
    <div class="board mb-3" role="grid" aria-label="Wordle board">
        {#each { length: TRIES } as _, row (row)}
            <div class="row-grid" role="row">
                {#each { length: LENGTH } as __, col (col)}
                    {@const c = cell(row, col)}
                    <div class="tile {c.state}" role="gridcell" aria-label={c.letter ? `${c.letter.toUpperCase()}, ${STATE_TEXT[c.state]}` : STATE_TEXT.empty}>{c.letter}</div>
                {/each}
            </div>
        {/each}
    </div>

    <div class="mb-3" style="min-height: 2.5rem;" aria-live="polite">
        {#if won}
            <div class="alert alert-success py-2 mb-0">You got it in {guesses.length}!</div>
        {:else if lost}
            <div class="alert alert-danger py-2 mb-0">The word was <strong class="text-uppercase">{answer}</strong>.</div>
        {:else if message}
            <div class="text-body-secondary">{message}</div>
        {/if}
    </div>

    <div class="keyboard mb-3">
        {#each KEYS as keys, rowIndex (rowIndex)}
            <div class="d-flex justify-content-center gap-1 mb-1">
                {#if rowIndex === 2}
                    <button class="key wide" type="button" onclick={() => press("enter")}>Enter</button>
                {/if}
                {#each [...keys] as letter (letter)}
                    <button class="key {keyStates[letter] ?? ''}" type="button" aria-label={keyStates[letter] ? `${letter.toUpperCase()}, ${STATE_TEXT[keyStates[letter]]}` : letter.toUpperCase()} onclick={() => press(letter)}>{letter}</button>
                {/each}
                {#if rowIndex === 2}
                    <button class="key wide" type="button" aria-label="Backspace" onclick={() => press("backspace")}><i class="bi bi-backspace"></i></button>
                {/if}
            </div>
        {/each}
    </div>

    <button class="btn btn-primary" type="button" onclick={newGame}>New game</button>
</div>

<style>
    .board {
        display: grid;
        gap: 6px;
    }

    .row-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
    }

    .tile {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.8rem;
        font-weight: 700;
        text-transform: uppercase;
        border: 2px solid var(--bs-border-color);
        border-radius: 4px;
    }

    .tile.typing {
        border-color: var(--bs-secondary-color);
    }

    /* A small symbol in each corner for people who cannot tell the colors apart. */
    .tile {
        position: relative;
    }

    .tile.correct::after,
    .tile.present::after,
    .tile.absent::after {
        position: absolute;
        top: 2px;
        right: 5px;
        font-size: 0.7rem;
        font-weight: 700;
    }

    .tile.correct::after {
        content: "✓";
    }

    .tile.present::after {
        content: "~";
    }

    .tile.absent::after {
        content: "✕";
    }

    .tile.correct,
    .key.correct {
        background: #538d4e;
        border-color: #538d4e;
        color: #fff;
    }

    .tile.present,
    .key.present {
        background: #b59f3b;
        border-color: #b59f3b;
        color: #fff;
    }

    .tile.absent,
    .key.absent {
        background: #3a3a3c;
        border-color: #3a3a3c;
        color: #fff;
    }

    .key {
        min-width: 2rem;
        height: 3rem;
        padding: 0 0.4rem;
        border: 0;
        border-radius: 4px;
        background: var(--bs-secondary-bg);
        color: var(--bs-body-color);
        font-weight: 600;
        text-transform: uppercase;
    }

    .key.wide {
        min-width: 3.2rem;
        font-size: 0.75rem;
    }
</style>
