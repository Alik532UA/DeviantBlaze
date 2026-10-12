import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [svelte()],
	test: {
		environment: 'node',
		include: ['src/**/*.test.js']
	},
	define: {
		__APP_VERSION__: JSON.stringify('0.0.2')
	},
	resolve: {
		alias: {
			'#lib': resolve(__dirname, 'src/lib'),
			'$app/environment': resolve(__dirname, 'test-mocks/app-environment.js')
		}
	}
});
