import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const buildVersion = `${packageJson.version}-${Date.now()}`;

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(buildVersion),
    },
    plugins: [plugin()],
    test: {
        environment: 'jsdom',
        setupFiles: './src/test/setup.ts',
    },
    server: {
        port: 59530,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5013',
                changeOrigin: true,
                secure: false,
            },
        },
    }
})