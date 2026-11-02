import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    root: path.resolve(__dirname, '..'),
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '..'),
        },
    },
    test: {
        include: ['tests/**/*.{test,spec}.{ts,tsx}'],
        environment: 'node',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
        },
    },
});