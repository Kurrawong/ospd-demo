#!/usr/bin/env bash

set -euo pipefail

release_tag="${1:-}"

if ! normalized_tag="$(
  npx --yes --package semver@7.8.5 -- semver "$release_tag"
)"; then
  echo "Release tag must be valid semantic versioning: $release_tag" >&2
  exit 1
fi

release_precedence="${release_tag%%+*}"
if [[ "$normalized_tag" != "$release_precedence" ]]; then
  echo "Release tag must use canonical semantic versioning: $normalized_tag" >&2
  exit 1
fi
