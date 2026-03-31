import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import {nodePolyfills} from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills(),
    ],
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        globals: true,
    },
})
