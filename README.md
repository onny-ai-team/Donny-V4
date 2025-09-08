# Donny V4

[![Smoke (Acceptance)](https://github.com/donny-ai-team/Donny-V4/actions/workflows/smoke.yml/badge.svg?branch=lab)](https://github.com/donny-ai-team/Donny-V4/actions/workflows/smoke.yml)

## Overview
Donny V4 - Self-aware deployment system with automated health checks and acceptance testing.

## Structure
- `apps/` - Application services (UI, API, Doctor)
- `infra/` - Infrastructure configuration
- `ops/` - Operations scripts and tests
- `docs/` - Documentation

## Quick Start
```bash
# Install dependencies
pnpm install

# Start all services
pm2 start infra/pm2/ecosystem.config.js

# Run smoke tests
node ops/tests/acceptance/smoke.mjs
```

## Health Endpoints
- UI: http://localhost:5000/health
- API: http://localhost:5055/api/health
- Doctor: http://localhost:5056/lab/api/browser/health
- <!-- ci trigger -->
<!-- ci trigger 2 -->

<!-- ci trigger auto-retry test -->
<!-- auto-retry test after fix -->
