import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      include: ['server/**/*.ts', 'app/**/*.ts', 'app/**/*.vue', 'shared/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/fixtures/**'],
    },
  },
})
