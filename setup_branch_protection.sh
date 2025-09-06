#!/bin/bash
# Setup branch protection for lab branch

OWNER="donny-ai-team"
REPO="Donny-V4"

echo "Setting up branch protection for lab branch..."

gh api \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  "/repos/$OWNER/$REPO/branches/lab/protection" \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f enforce_admins=false \
  -f required_status_checks='{"strict":true,"checks":[{"context":"Smoke / smoke"}]}' \
  -f restrictions=null

echo "Branch protection configured!"
echo "Rules applied:"
echo "- Require 1 approval"
echo "- Require 'Smoke / smoke' status check to pass"
echo "- Status checks must be up-to-date (strict mode)"
