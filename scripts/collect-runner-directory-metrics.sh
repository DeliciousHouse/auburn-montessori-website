#!/usr/bin/env bash
set -euo pipefail

RUNNER_ROOT_FILE="${RUNNER_ROOT_FILE:-/etc/node_exporter/runner-root}"
TEXTFILE_COLLECTOR_DIR="${TEXTFILE_COLLECTOR_DIR:-/var/lib/node_exporter/textfile}"

if [[ -z "${RUNNER_ROOT:-}" ]]; then
  [[ -r "${RUNNER_ROOT_FILE}" ]] || {
    printf 'runner root file is not readable: %s\n' "${RUNNER_ROOT_FILE}" >&2
    exit 1
  }
  IFS= read -r RUNNER_ROOT < "${RUNNER_ROOT_FILE}"
fi

for name in _diag _work; do
  [[ -d "${RUNNER_ROOT}/${name}" ]] || {
    printf 'runner directory is missing: %s/%s\n' "${RUNNER_ROOT}" "${name}" >&2
    exit 1
  }
done

directory_bytes() {
  find "$1" -type f -printf '%s\n' | awk '{ total += $1 } END { printf "%.0f\n", total + 0 }'
}

mkdir -p "${TEXTFILE_COLLECTOR_DIR}"
output="${TEXTFILE_COLLECTOR_DIR}/github-actions-runner.prom"
temporary="$(mktemp "${output}.tmp.XXXXXX")"
trap 'rm -f -- "${temporary}"' EXIT

printf 'github_actions_runner_directory_bytes{path="_diag"} %s\n' \
  "$(directory_bytes "${RUNNER_ROOT}/_diag")" > "${temporary}"
printf 'github_actions_runner_directory_bytes{path="_work"} %s\n' \
  "$(directory_bytes "${RUNNER_ROOT}/_work")" >> "${temporary}"
chmod 0644 "${temporary}"
mv -f -- "${temporary}" "${output}"
trap - EXIT
