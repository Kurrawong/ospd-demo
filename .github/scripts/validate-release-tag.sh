#!/usr/bin/env bash

set -euo pipefail

release_tag="${1:-}"
semver_pattern='^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(-((0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*)(\.(0|[1-9][0-9]*|[0-9]*[A-Za-z-][0-9A-Za-z-]*))*))?(\+([0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*))?$'

if [[ ! "$release_tag" =~ $semver_pattern ]]; then
  echo "Release tag must be valid semantic versioning prefixed with v: $release_tag" >&2
  exit 1
fi
