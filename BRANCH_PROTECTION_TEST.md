# Branch Protection Test

This file tests the branch protection configuration for `lab`:

## Requirements being tested:
- ✅ Requires pull request before merging
- ✅ Required approvals: 1
- ✅ Required status check: Smoke (Acceptance)
- ✅ Require branches to be up-to-date
- ✅ Auto-merge functionality with protection

## Expected behavior:
1. Cannot merge without approval
2. Cannot merge if Smoke fails
3. Cannot merge if branch is out-of-date
4. Auto-merge works when all conditions are met