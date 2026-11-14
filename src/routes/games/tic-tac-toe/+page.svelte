<script>
    import { bestMove, winnerOf } from "#lib/games.js";

    let board = $state(Array(9).fill(null));
    let human = $state("X");
    let scores = $state({ you: 0, computer: 0, draws: 0 });

    const win = $derived(winnerOf(board));
    const full = $derived(board.every(Boolean));
    const over = $derived(!!win || full);
    const ai = $derived(human === "X" ? "O" : "X");

    const finish = () => {
        const result = winnerOf(board);
        if (result) scores[result.player === human ? "you" : "computer"]++;
        else if (board.every(Boolean)) scores.draws++;
    };

    const computerMove = () => {
        if (winnerOf(board) || board.every(Boolean)) return;
        board[bestMove(board, ai)] = ai;
        finish();
    };

    const play = (index) => {
        if (board[index] || over) return;
        board[index] = human;
        finish();
        computerMove();
    };

    const reset = (nextHuman = human) => {
        human = nextHuman;
        board = Array(9).fill(null);
        // X always goes first, so the computer opens when you play O.
        if (nextHuman === "O") computerMove();
    };

    const status = $derived(
        win ? (win.player === human ? "You win!" : "The computer wins.") : full ? "It's a draw." : "Your move."
    );
</script>

<svelte:head>
    <title>Tic Tac Toe | Mools</title>
</svelte:head>

<h1>Tic Tac Toe</h1>
<p class="text-body-secondary mb-3">Play against the computer. It plays perfectly, so the best you can do is a draw.</p>

<div class="mx-auto text-center" style="max-width: 20rem;">
    <div class="d-flex justify-content-center gap-2 mb-3">
        <button class="btn btn-sm {human === 'X' ? 'btn-primary' : 'btn-outline-primary'}" type="button" onclick={() => reset("X")}>Play as X</button>
        <button class="btn btn-sm {human === 'O' ? 'btn-primary' : 'btn-outline-primary'}" type="button" onclick={() => reset("O")}>Play as O</button>
    </div>

    <div class="grid mb-3">
        {#each board as cell, index (index)}
            <button
                class="square"
                class:win={win?.line.includes(index)}
                type="button"
                aria-label="Square {index + 1}{cell ? `, ${cell}` : ''}"
                disabled={!!cell || over}
                onclick={() => play(index)}
            >{cell ?? ""}</button>
        {/each}
    </div>

    <p class="fw-semibold" aria-live="polite">{status}</p>
    <p class="small text-body-secondary">You {scores.you} · Computer {scores.computer} · Draws {scores.draws}</p>
    <button class="btn btn-primary" type="button" onclick={() => reset()}>New game</button>
</div>

<style>
    .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
    }

    .square {
        aspect-ratio: 1;
        font-size: 2.5rem;
        font-weight: 700;
        border: 2px solid var(--bs-border-color);
        border-radius: 8px;
        background: var(--bs-body-bg);
        color: var(--bs-body-color);
    }

    .square:disabled {
        opacity: 1;
    }

    .square.win {
        background: var(--bs-success-bg-subtle);
        border-color: var(--bs-success);
    }
</style>
