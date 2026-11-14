// Cryptographically secure random helpers

export const randomInt = (max) => {
    if (max <= 0) throw new RangeError('max must be positive');
    const limit = Math.floor(0x100000000 / max) * max;
    const buffer = new Uint32Array(1);
    do {
        crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);
    return buffer[0] % max;
};

export const pick = (list) => list[randomInt(list.length)];

export const shuffle = (list) => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};
