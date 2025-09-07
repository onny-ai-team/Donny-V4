#!/bin/bash

# Lab Gate Status Check Script
# Monitors the Lab Gate endpoint and prints one-line status
# Usage: ./kuma-gate-check.sh [host]

HOST="${1:-99.76.234.25}"
PORT="5056"
ENDPOINT="http://${HOST}:${PORT}/lab/gate/status"

# Fetch status with timeout
RESPONSE=$(curl -s -m 5 "${ENDPOINT}" 2>/dev/null)
EXIT_CODE=$?

# Check if curl succeeded
if [ $EXIT_CODE -ne 0 ]; then
    echo "❌ Lab Gate UNREACHABLE - Failed to connect to ${ENDPOINT}"
    exit 1
fi

# Parse JSON response
OK=$(echo "$RESPONSE" | grep -o '"ok":[^,}]*' | cut -d':' -f2 | tr -d ' ')
SHA=$(echo "$RESPONSE" | grep -o '"sha":"[^"]*"' | cut -d'"' -f4)
WHEN=$(echo "$RESPONSE" | grep -o '"when":"[^"]*"' | cut -d'"' -f4)

# Check if we got valid JSON
if [ -z "$OK" ]; then
    echo "❌ Lab Gate INVALID - Invalid response from ${ENDPOINT}"
    exit 2
fi

# Format timestamp to human readable
if [ -n "$WHEN" ]; then
    # Calculate time ago
    WHEN_EPOCH=$(date -d "$WHEN" +%s 2>/dev/null || echo "0")
    NOW_EPOCH=$(date +%s)
    if [ "$WHEN_EPOCH" -ne "0" ]; then
        DIFF=$((NOW_EPOCH - WHEN_EPOCH))
        if [ $DIFF -lt 60 ]; then
            AGO="${DIFF}s ago"
        elif [ $DIFF -lt 3600 ]; then
            AGO="$((DIFF / 60))m ago"
        elif [ $DIFF -lt 86400 ]; then
            AGO="$((DIFF / 3600))h ago"
        else
            AGO="$((DIFF / 86400))d ago"
        fi
    else
        AGO="unknown time"
    fi
else
    AGO="no timestamp"
fi

# Output status based on ok field
if [ "$OK" = "true" ]; then
    echo "✅ Lab Gate PASS - SHA: ${SHA:-unknown} (${AGO}) - ${ENDPOINT}"
    exit 0
else
    echo "❌ Lab Gate FAIL - SHA: ${SHA:-unknown} (${AGO}) - ${ENDPOINT}"
    exit 1
fi