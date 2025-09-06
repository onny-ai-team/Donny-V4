# Donny V4 - Milestones Log

## ✅ Phase 1: Skeleton + Health Endpoints (COMPLETE)

### 1. Environment Setup
- Created clean directory structure at `/home/harry/Donny-V4`
- Linked storage to `/mnt/donny/DonnyV4_storage`
- Installed tools: Node v22, pnpm v9, pm2 v6, git, jq

### 2. Monorepo Structure
```
Donny-V4/
├── apps/
│   ├── ui/         (Next.js on port 5000)
│   ├── api/        (Express on port 5055)
│   └── doctor/     (Express on port 5056)
├── infra/
│   ├── nginx/
│   ├── pm2/
│   ├── kuma/
│   └── n8n/
├── ops/
│   ├── scripts/
│   └── tests/
├── docs/
└── storage/ → /mnt/donny/DonnyV4_storage
```
- Root `package.json`, `pnpm-workspace.yaml`, `.gitignore`

### 3. UI App (Next.js)
- Port **5000**  
- Added `/health` route → returns `{ "status": "ok", "service": "ui", "version": "v0" }`

### 4. API App (Express + TypeScript)
- Port **5055**  
- Added `/api/health` → returns `{ "status": "ok", "app": "donny-api", "version": "v0" }`

### 5. Doctor App (Express + TypeScript)
- Port **5056**  
- Added `/lab/api/browser/health` → returns `{ "status": "ok", "browser": "ready", "version": "v0" }`

### 6. Process Management
- PM2 ecosystem file created  
- All three services running under PM2  
- Verified via `pm2 status` → `donny-ui`, `donny-api`, `donny-doctor` all online  

### 7. Verification
- Local curl checks: ✅  
  - `/health` (UI)  
  - `/api/health` (API)  
  - `/lab/api/browser/health` (Doctor)  
- Browser checks from laptop: ✅ All three accessible

### 8. GitHub Integration
- Repo initialized and committed: **"Donny v4 Phase 1: skeleton + health"**  
- Branches:  
  - `main` → Production  
  - `lab` → Testing  
- Both branches pushed to GitHub: https://github.com/donny-ai-team/Donny-V4

---

## 📌 Current State
- Skeleton running  
- Health endpoints working  
- Repo live on GitHub with main + lab  
- Storage linked to large disk  
- Phase 1 milestone ✅ complete  

---

## 🎯 Next Phase (Phase 2 Goals)
- Add **Doctor Blueprint tab** (Milestones → Tasks → Checks)  
- Create **Acceptance Pack shell** (basic smoke tests wired into Doctor)  
- Add **CI workflow** (GitHub Actions runs smoke tests on PRs)  
