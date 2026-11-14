import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		host: true,
		port: 6969
	},
	plugins: [
		sveltekit({
			adapter: adapter(),
			paths: { base: '/tools' },
			prerender: {
				handleHttpError: ({ path, referrer, message }) => {
					// Ignore deliberate link to shiny 404 page
					if (path === '/404' && referrer === '/tools/error') return;
					throw new Error(message);
				}
			}
		})
	]
});
