import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Tests live OUTSIDE netlify/functions/. Netlify treats every file in the
    // functions directory as a function, and a name containing a dot
    // ("contact.test") fails its "alphanumeric, hyphen & underscore" rule,
    // which blocks the whole deploy.
    //
    // apps/qr keeps its tests beside its own functions (apps/qr/netlify/tests)
    // so they move with the app if it is extracted; they run from here because
    // apps/qr has no test runner of its own yet. They import only apps/qr code
    // plus packages the root also installs (jose, cookie), so CI's root
    // `npm ci` is enough.
    include: ['netlify/tests/**/*.test.ts', 'src/**/*.test.ts', 'apps/qr/netlify/tests/**/*.test.ts'],
  },
})
