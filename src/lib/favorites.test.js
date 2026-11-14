import { describe, expect, it } from 'vitest';
import { FAVORITES_KEY, parseFavorites, readFavorites, toggleFavorite, writeFavorites } from './favorites.js';

const memoryStorage = (initial = {}) => {
    const data = { ...initial };
    return { getItem: (k) => data[k] ?? null, setItem: (k, v) => void (data[k] = v), data };
};

describe('favorites', () => {
    it('parses stored data defensively', () => {
        expect(parseFavorites(null)).toEqual([]);
        expect(parseFavorites('not json')).toEqual([]);
        expect(parseFavorites('{"a":1}')).toEqual([]);
        expect(parseFavorites('["/a","/b","/a",3,null]')).toEqual(['/a', '/b']);
    });

    it('toggles and puts new favorites first', () => {
        expect(toggleFavorite(['/a'], '/b')).toEqual(['/b', '/a']);
        expect(toggleFavorite(['/b', '/a'], '/b')).toEqual(['/a']);
        expect(toggleFavorite([], '/a')).toEqual(['/a']);
    });

    it('round-trips through storage', () => {
        const storage = memoryStorage();
        expect(writeFavorites(['/x', '/y'], storage)).toBe(true);
        expect(storage.data[FAVORITES_KEY]).toBe('["/x","/y"]');
        expect(readFavorites(storage)).toEqual(['/x', '/y']);
    });

    it('survives storage that throws', () => {
        const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
        expect(readFavorites(broken)).toEqual([]);
        expect(writeFavorites(['/x'], broken)).toBe(false);
    });
});
