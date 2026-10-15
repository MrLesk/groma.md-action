#!/usr/bin/env bash
set -euo pipefail

logs_directory="$(mktemp -d "$RUNNER_TEMP/groma-npm-logs-XXXXXXXXXXXX")"
{
  printf 'logs-directory=%s\n' "$logs_directory"
  printf 'logs-name=%s\n' "$(basename "$logs_directory")"
} >> "$GITHUB_OUTPUT"

for attempt in 1 2 3; do
  echo "Installing Groma $GROMA_VERSION (attempt $attempt/3)"
  if npm install --global --include=optional --logs-dir "$logs_directory" "groma.md@$GROMA_VERSION" \
    && version="$(groma --version)"; then
    printf 'version=%s\n' "$version" >> "$GITHUB_OUTPUT"
    exit 0
  fi

  if [[ "$attempt" -lt 3 ]]; then
    echo "Groma installation or verification failed; retrying in 10 seconds." >&2
    sleep 10
  fi
done

echo "::error::Groma installation or verification failed after 3 attempts. See the npm logs artifact." >&2
exit 1
