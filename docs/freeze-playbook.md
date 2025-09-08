# 🧊 Lab Freeze Playbook

## What Does Freeze Do?
- **Blocks all merges** to `lab` branch via required status check
- **Freeze Gate** check fails when frozen, preventing merge button
- Works with auto-merge, manual merge, and CLI merges
- **State stored on `freeze-state` branch** (no protected branch bypass needed)

## One-Time Setup

✅ **No PAT or bypass needed!** The system uses a dedicated `freeze-state` branch that isn't protected.

### Verify Setup
1. Check that `freeze-state` branch exists
2. Confirm `.ops/lab-freeze.json` exists on that branch
3. Ensure "Freeze Gate" is in required status checks for `lab`

## How to Use

### 🔴 Turn ON Freeze
1. Find any open PR or Issue
2. Add label: **`freeze-lab`**
3. Watch Actions tab → "Freeze Toggle" workflow runs
4. State file updated on `freeze-state` branch
5. Check any PR targeting lab → **Freeze Gate: ❌ Failing**
6. Comment posted: "🧊 Freeze ENABLED (state updated on branch `freeze-state`)"

### 🟢 Turn OFF Freeze  
1. Remove label: **`freeze-lab`**
2. Workflow runs again
3. State file updated on `freeze-state` branch
4. PRs show **Freeze Gate: ✅ Passing**
5. Comment posted: "🧊 Freeze DISABLED (state updated on branch `freeze-state`)"

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Workflow fails to push | Ensure `freeze-state` branch exists |
| Freeze Gate not updating | Trigger PR sync or wait for next push |
| Freeze Gate not showing | Check Settings → Rules → Required status checks includes "Freeze Gate" |
| Label doesn't trigger workflow | Ensure label is exactly `freeze-lab` (case-sensitive) |

## Quick Status Check
- View freeze state: Check `.ops/lab-freeze.json` on **`freeze-state` branch**
- Direct link: `https://github.com/[owner]/[repo]/blob/freeze-state/.ops/lab-freeze.json`
- See who froze: Look at `by` field in JSON
- Check reason: Look at `reason` field in JSON
- View history: Check commits on `freeze-state` branch