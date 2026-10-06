import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				precompress: false,
				strict: true
			}),
			paths: {
				base: mode === 'production' ? '/DeviantBlaze' : '',
				relative: false,
				origin: 'https://alik532ua.github.io'
			},
			prerender: {
				handleHttpError: ({ path, message }) => {
					if (path.startsWith('/DigitalWorkshop')) return;
					throw new Error(message);
				}
			}
		})
	]
}));
