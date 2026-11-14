import { readFavorites, toggleFavorite, writeFavorites } from './favorites.js';

// Shared reactive list of favorite tool paths. Call `load()` on the client (it reads localStorage).
let list = $state([]);

export const favorites = {
    get list() {
        return list;
    },
    has(path) {
        return list.includes(path);
    },
    load() {
        list = readFavorites();
    },
    toggle(path) {
        list = toggleFavorite(list, path);
        writeFavorites(list);
    }
};
