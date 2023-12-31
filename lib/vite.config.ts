import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
	plugins: [
		react(),
		dts({
			rollupTypes: true,
			rollupConfig: {
				bundledPackages: ['typesafe-i18n'],
			},
		}),
	],
	build: {
		lib: {
			entry: [
				path.resolve(__dirname, 'src/index.ts'),
				path.resolve(__dirname, 'src/internal.ts'),
			],
			name: 'react-typesafe-i18n',
			formats: ['es', 'cjs'],
			fileName: function (format, entry) {
				return `${entry.includes('internal') ? 'internal' : 'index'}.${
					format === 'es' ? 'mjs' : 'js'
				}`;
			},
		},
		rollupOptions: {
			external: ['react', 'valibot'],
			output: {
				// Since we publish our ./src folder, there's no point
				// in bloating sourcemaps with another copy of it.
				sourcemapExcludeSources: true,
			},
		},
		sourcemap: true,
		// Reduce bloat from legacy polyfills.
		target: 'esnext',
		// Leave minification up to applications.
		minify: false,
	},
});
