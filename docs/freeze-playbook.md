# 🧊 Lab Freeze Playbook

## What Does Freeze Do?
- **Blocks all merges** to `lab` branch via required status check
- **Freeze Gate** check fails when frozen, preventing merge button
- Works with auto-merge, manual merge, and CLI merges

## One-Time Setup

### 1. Create Classic PAT
- Go to GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)**
- Generate new token with:
  - Name: `Freeze Bot Classic PAT`
  - Scope: ✅ **`repo`** (automatically includes "Bypass branch protections")
  - Expiration: 90 days or longer

### 2. Add Repository Secret
- Go to repo Settings → Secrets and variables → Actions
- New repository secret: **`FREEZE_BOT_PAT`**
- Value: Your classic PAT from step 1

## How to Use

### 🔴 Turn ON Freeze
1. Find any open PR or Issue
2. Add label: **`freeze-lab`**
3. Watch Actions tab → "Freeze Toggle" workflow runs
4. Check any PR targeting lab → **Freeze Gate: ❌ Failing**
5. Comment posted: "🧊 Freeze ENABLED"

### 🟢 Turn OFF Freeze  
1. Remove label: **`freeze-lab`**
2. Workflow runs again
3. PRs show **Freeze Gate: ✅ Passing**
4. Comment posted: "🧊 Freeze DISABLED"

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Workflow fails immediately | Create `FREEZE_BOT_PAT` secret with classic PAT |
| Push to lab fails | Ensure PAT has `repo` scope (includes bypass) |
| Freeze Gate not showing | Check Settings → Rules → Required status checks includes "Freeze Gate" |
| Label doesn't trigger workflow | Ensure label is exactly `freeze-lab` (case-sensitive) |

## Quick Status Check
- View freeze state: Check `.ops/lab-freeze.json` in lab branch
- See who froze: Look at `by` field in JSON
- Check reason: Look at `reason` field in JSON