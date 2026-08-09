import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Tests live OUTSIDE netlify/functions/. Netlify treats every file in the
    // functions directory as a function, and a name containing a dot
    // ("contact.test") fails its "alphanumeric, hyphen & underscore" rule,
    // which blocks the whole deploy.
    include: ['netlify/tests/**/*.test.ts'],
  },
})
