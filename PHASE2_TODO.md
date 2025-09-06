# Donny v4 — Phase 2 TODO (Blueprint + Acceptance)

## Goal
Make Donny self-aware in Lab: Blueprint tab in Doctor + basic Acceptance Pack + CI smoke tests.

## Tasks (tick as we complete)
- [ ] Doctor: add **Blueprint** tab (UI stub)
  - [ ] Tabs: Kundli | **Blueprint** | Snapshots | Packs | Logs
  - [ ] Blueprint schema in memory (Milestones → Tasks → Checks)
  - [ ] Seed 3 milestones: Doctor Core, Dashboard Pages, Watchdog

- [ ] Acceptance Pack (shell, Lab)
  - [ ] Dir `ops/tests/acceptance/`
  - [ ] Script `ops/tests/acceptance/smoke.mjs` runs:
        - GET UI `/health`
        - GET API `/api/health`
        - GET Doctor `/lab/api/browser/health`
  - [ ] Write JSON results to `storage/acceptance/latest.json`
  - [ ] Exit non-zero on any fail

- [ ] Doctor: **Packs** tab (read-only)
  - [ ] Read and render `storage/acceptance/latest.json`
  - [ ] Show ✅/❌ badges and timestamps

- [ ] CI (GitHub Actions)
  - [ ] Workflow `.github/workflows/smoke.yml`
  - [ ] On PRs to `lab`: run `node ops/tests/acceptance/smoke.mjs` (mock URLs)
  - [ ] Upload artifact of results to the PR

- [ ] Gate (manual for now)
  - [ ] Simple rule in Doctor: show **Promote ready** only if latest pack = all green
  - [ ] (Button stays disabled; full Promote comes in Phase 5/6)

- [ ] Docs
  - [ ] Update `MILESTONES.md` with "Phase 2 started"
  - [ ] Add brief `docs/acceptance.md` on how the pack works

## Acceptance Criteria (Phase 2)
- [ ] Doctor shows **Blueprint** tab with seeded milestones/tasks/checks
- [ ] Running `node ops/tests/acceptance/smoke.mjs` produces JSON
- [ ] Doctor **Packs** tab renders the JSON with ✅/❌
- [ ] CI runs smoke on PRs to `lab` and attaches artifact
- [ ] A green pack causes "Promote ready" indicator to turn on (button still disabled)

