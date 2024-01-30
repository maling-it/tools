import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/kit/vite";
/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		paths: {
			base: "/tools"
		},
		prerender: {
			
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore deliberate link to shiny 404 page
				if (path === '/404' && referrer === '/tools/error') {
					return;
				}

				// Otherwise fail the build
				throw new Error(message);
			}
		}
	},
	preprocess: vitePreprocess()
};
export default config;
