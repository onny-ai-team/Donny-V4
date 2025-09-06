### Quick checks
- [ ] All health endpoints GREEN (UI `/health`, API `/api/health`, Doctor `/lab/api/browser/health`)
- [ ] Smoke test passes locally (`TARGET_HOST=99.76.234.25 node ops/tests/acceptance/smoke.mjs`)
- [ ] No secrets/keys in the diff
- [ ] Doctor Packs show overall **PASS** at `/lab/doctor/packs`
- [ ] Artifacts accessible (e.g., `/files/artifacts/...`)
- [ ] Includes link to acceptance pack (CI artifact) if relevant

> Notes:
