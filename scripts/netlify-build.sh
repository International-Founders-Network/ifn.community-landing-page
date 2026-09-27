#!/usr/bin/env bash
set -euo pipefail
# @ifn/ui is public on GitHub; no private-dep auth rewrite needed.
npx puppeteer browsers install chrome
npm run build
