#!/usr/bin/env bash
set -euo pipefail
# Auth for private @ifn/ui happens in npm preinstall (scripts/auth-private-github.sh).
npx puppeteer browsers install chrome
npm run build
