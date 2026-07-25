import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['netlify/functions/**/*.test.ts'],
  },
})
