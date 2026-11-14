// Favorite tools, stored in the browser. The pure helpers take the storage as a parameter so they are easy to test.

export const FAVORITES_KEY = 'mools-favorites';

export const parseFavorites = (raw) => {
    try {
        const value = JSON.parse(raw ?? '[]');
        return Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string'))] : [];
    } catch {
        return [];
    }
};

// Newly added favorites go first; toggling an existing one removes it.
export const toggleFavorite = (list, path) => (list.includes(path) ? list.filter((item) => item !== path) : [path, ...list]);

export const readFavorites = (storage = globalThis.localStorage) => {
    try {
        return parseFavorites(storage.getItem(FAVORITES_KEY));
    } catch {
        return [];
    }
};

export const writeFavorites = (list, storage = globalThis.localStorage) => {
    try {
        storage.setItem(FAVORITES_KEY, JSON.stringify(list));
        return true;
    } catch {
        return false;
    }
};
