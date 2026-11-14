import { resolve } from '$app/paths';

// `base` was removed from `$app/paths` in SvelteKit 3; derive it from `resolve`.
export const base = resolve('/').replace(/\/$/, '');
