import {defineConfig} from 'vitest/config';
export default defineConfig({test:{include:['server/src/**/*.test.ts'],testTimeout:10_000,hookTimeout:20_000,pool:'threads'}});

