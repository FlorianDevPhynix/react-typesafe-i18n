import { defineConfig, HttpProxy } from 'vite';
import react from '@vitejs/plugin-react';
import { LanguageServerPlugin } from './language-server';

function add_proxylog(proxy: HttpProxy.Server) {
	proxy.on('error', (err) => {
		console.log('proxy error', err);
	});
	proxy.on('proxyReq', (proxyReq, req) => {
		console.log(
			`${req.method} Request "${req.url}" to Target ${proxyReq.host}${proxyReq.path}`
		);
	});
	proxy.on('proxyRes', (proxyRes, req) => {
		console.log(
			`${req.method} Response ${proxyRes.statusCode} "${req.url}" from Target ${proxyRes.headers.host}${proxyRes.url}`
		);
	});
}

const backend_host = '10.41.144.40:20000';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), /* LogPlugin(), */ LanguageServerPlugin()],
	server: {
		proxy: {
			'/common-i18n/rest/': {
				target: `http://${backend_host}/common-i18n/rest/`,
				rewrite: (path) => path.replace(/^\/common-i18n\/rest\//, ''),
				configure: add_proxylog,
			},
		},
	},
	resolve: {
		alias: {
			'@/lib': './src/lib-import.ts',
		},
	},
});
