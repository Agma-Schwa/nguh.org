import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { importAssets } from 'svelte-preprocess-import-assets';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			adapter: adapter(),
			alias: { $lib: 'src/lib' },
			preprocess: [importAssets(), vitePreprocess({ script: true })],
			compilerOptions: {
				experimental: { async: true }
			},
			version: { pollInterval: 0 }
		})
	]
});
