import { describe, expect, it } from 'vitest';
import { ANSWERS, bestMove, evaluateGuess, memoryDeck, winnerOf } from './games.js';

describe('wordle', () => {
    it('marks correct, present and absent letters', () => {
        expect(evaluateGuess('crane', 'cabin')).toEqual(['correct', 'absent', 'present', 'present', 'absent']);
    });

    it('does not over-count repeated letters', () => {
        expect(evaluateGuess('speed', 'abide')).toEqual(['absent', 'absent', 'present', 'absent', 'present']);
        expect(evaluateGuess('geese', 'where')).toEqual(['absent', 'absent', 'correct', 'absent', 'correct']);
    });

    it('only uses five letter lowercase answers', () => {
        expect(ANSWERS.every((word) => /^[a-z]{5}$/.test(word))).toBe(true);
        expect(new Set(ANSWERS).size).toBe(ANSWERS.length);
    });
});

describe('tic tac toe', () => {
    it('detects winners', () => {
        expect(winnerOf(['X', 'X', 'X', null, 'O', 'O', null, null, null])).toEqual({ player: 'X', line: [0, 1, 2] });
        expect(winnerOf(Array(9).fill(null))).toBeNull();
    });

    it('takes a win and blocks a loss', () => {
        expect(bestMove(['O', 'O', null, 'X', 'X', null, null, null, null], 'O')).toBe(2);
        expect(bestMove(['X', 'X', null, null, 'O', null, null, null, null], 'O')).toBe(2);
    });

    it('never loses against itself', () => {
        let board = Array(9).fill(null);
        let player = 'X';
        while (!winnerOf(board) && board.some((cell) => !cell)) {
            board[bestMove(board, player)] = player;
            player = player === 'X' ? 'O' : 'X';
        }
        expect(winnerOf(board)).toBeNull();
    });
});

describe('memory', () => {
    it('deals every symbol twice', () => {
        const deck = memoryDeck();
        expect(deck).toHaveLength(16);
        expect(new Set(deck.map((card) => card.id)).size).toBe(16);
    });
});
