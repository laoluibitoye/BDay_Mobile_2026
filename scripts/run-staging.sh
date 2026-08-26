#!/bin/bash
# Runs the app against the live staging site (stg18326.businessday.ng) and its connected
# Render subscription-service instance.
#
# Why this exists rather than just exporting EXPO_PUBLIC_* before `expo start`: Expo's own env
# loader (@expo/env) loads .env.local unconditionally and it wins over already-exported shell
# env vars in the babel inline-environment-variables transform — confirmed by inspecting the
# actual bundle output, which baked in .env.local's localhost URLs as string literals even with
# EXPO_PUBLIC_API_BASE_URL exported in the process env. The only reliable way to override is to
# make .env.local itself hold the staging values while Metro is running, then put it back.
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=.env.local
BACKUP_FILE=.env.local.pre-staging.bak

if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "$BACKUP_FILE"
fi

restore() {
  if [ -f "$BACKUP_FILE" ]; then
    mv "$BACKUP_FILE" "$ENV_FILE"
    echo "Restored $ENV_FILE to local dev defaults."
  fi
}
trap restore EXIT INT TERM

cat > "$ENV_FILE" <<'EOF'
# Temporarily overwritten by scripts/run-staging.sh — restored automatically on exit.
EXPO_PUBLIC_API_BASE_URL=https://aero-paywall-web-admin.onrender.com
EXPO_PUBLIC_WP_BASE_URL=https://stg18326.businessday.ng
EOF

CI=1 npx expo start --ios
