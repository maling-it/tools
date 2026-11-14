import { shuffle } from './random.js';

// Wordle: returns "correct" | "present" | "absent" per letter, handling repeated letters.
export const evaluateGuess = (guess, answer) => {
    const result = Array(guess.length).fill('absent');
    const remaining = {};

    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === answer[i]) result[i] = 'correct';
        else remaining[answer[i]] = (remaining[answer[i]] ?? 0) + 1;
    }
    for (let i = 0; i < guess.length; i++) {
        if (result[i] === 'correct') continue;
        if (remaining[guess[i]] > 0) {
            result[i] = 'present';
            remaining[guess[i]]--;
        }
    }
    return result;
};

export const ANSWERS = `about above actor adapt admit adopt adult after again agent agree ahead alarm album alert alike alive allow alone along alter among anger angle angry apart apple apply arena argue arise armor arrow aside asset avoid awake award aware badly baker basic beach began begin being below bench birth black blade blame blank blast blend bless blind block blood board boost bound brain brand brave bread break brick brief bring broad brown brush build burst cabin cable candy carry catch cause chain chair chalk charm chart chase cheap check chest chief child chill civil claim class clean clear clerk click climb clock close cloud coach coast color count court cover craft crash crazy cream crime cross crowd crown curve daily dance dealt death debut delay depth dirty doubt dozen draft drain drama dream dress drift drink drive eager early earth eight elect empty enemy enjoy enter equal error event every exact exist extra faith false fancy fault fever field fifth fifty fight final first flame flash fleet floor flour fluid focus force forth forty found frame fresh front fruit funny ghost giant given glass globe glory grace grade grain grand grant grape grass great green greet group guard guess guest guide habit happy harsh heart heavy hello hence honey honor horse hotel house human humor ideal image imply index inner input issue ivory jelly joint judge juice knife knock known label labor large laser later laugh layer learn least leave legal lemon level light limit local logic loose lover lower loyal lucky lunch magic major maker march match maybe mayor media mercy merit metal meter might minor minus mixed model money month moral motor mount mouse mouth movie music naive nerve never newly night noble noise north novel nurse ocean offer often olive onion opera orbit order other ought paint panel paper party pasta patch pause peace pearl phase phone photo piano piece pilot pitch pizza place plain plane plant plate point polar pound power press price pride prime print prior prize proof proud prove pulse queen quick quiet quite quote radio raise range rapid ratio reach react ready realm refer relax reply rider ridge right rigid risky rival river robot rocky rough round route royal rural salad sauce scale scene scope score sense serve seven shade shake shall shape share sharp sheep sheet shelf shell shift shine shirt shock shoot shore short shown sight silly since sixth sixty skill sleep slice slide small smart smile smoke snake solar solid solve sorry sound south space spare speak speed spell spend spice spoke sport staff stage stair stamp stand stare start state steam steel stick still stock stone store storm story strip study stuff style sugar suite sunny super sweet swift swing sword table taste teach thank their theme there thick thing think third those three throw thumb tiger tight timer tired title today toast token tooth topic total touch tough tower trace track trade trail train treat trend trial tribe trick truck truly trust truth twice uncle under union unity until upper upset urban usage usual valid value video virus visit vital vocal voice waste watch water weary wheel where which while white whole whose wider woman world worry worth would wound write wrong yield young youth zebra`.split(/\s+/);

// Tic tac toe
const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

export const winnerOf = (board) => {
    for (const [a, b, c] of LINES) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) return { player: board[a], line: [a, b, c] };
    }
    return null;
};

const minimax = (board, player, ai, depth) => {
    const win = winnerOf(board);
    if (win) return win.player === ai ? 10 - depth : depth - 10;
    if (board.every(Boolean)) return 0;

    const scores = [];
    for (let i = 0; i < 9; i++) {
        if (board[i]) continue;
        const next = [...board];
        next[i] = player;
        scores.push(minimax(next, player === 'X' ? 'O' : 'X', ai, depth + 1));
    }
    return player === ai ? Math.max(...scores) : Math.min(...scores);
};

// Perfect-play move for `ai` on a board of "X" | "O" | null.
export const bestMove = (board, ai) => {
    const human = ai === 'X' ? 'O' : 'X';
    let best = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
        if (board[i]) continue;
        const next = [...board];
        next[i] = ai;
        const score = minimax(next, human, ai, 1);
        if (score > best) {
            best = score;
            move = i;
        }
    }
    return move;
};

// Memory match
export const EMOJI = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍑', '🥝', '🍍'];

export const memoryDeck = () => shuffle([...EMOJI, ...EMOJI].map((symbol, index) => ({ id: index, symbol })));
