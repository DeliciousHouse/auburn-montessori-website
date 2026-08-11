#!/usr/bin/env bash
set -euo pipefail

VERSION=1.12.1
EXPECTED_TAILSCALE_IP=100.110.92.60
TAILSCALE_IP="${TAILSCALE_IP:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${TAILSCALE_IP}" != "${EXPECTED_TAILSCALE_IP}" ]]; then
  printf 'TAILSCALE_IP must be %s; refusing public or unexpected bind address\n' \
    "${EXPECTED_TAILSCALE_IP}" >&2
  exit 1
fi
if ! ip -o -4 addr show | awk -v ip="${TAILSCALE_IP}" '$4 ~ ("^" ip "/") { found=1 } END { exit !found }'; then
  printf 'Tailscale address is not assigned on this host: %s\n' "${TAILSCALE_IP}" >&2
  exit 1
fi

candidates=()
add_candidate() {
  local candidate existing
  [[ -n "${1:-}" && -d "$1" ]] || return 0
  candidate="$(readlink -f -- "$1")"
  [[ -d "${candidate}/_diag" && -d "${candidate}/_work" ]] || return 0
  for existing in "${candidates[@]:-}"; do
    [[ "${existing}" == "${candidate}" ]] && return 0
  done
  candidates+=("${candidate}")
}

if [[ -n "${RUNNER_TEMP:-}" ]]; then
  add_candidate "${RUNNER_TEMP}/../.."
fi
if [[ -n "${RUNNER_WORKSPACE:-}" ]]; then
  path="$(readlink -f -- "${RUNNER_WORKSPACE}")"
  while [[ "${path}" != / ]]; do
    if [[ "$(basename "${path}")" == _work ]]; then
      add_candidate "$(dirname "${path}")"
      break
    fi
    parent="$(dirname "${path}")"
    [[ "${parent}" == "${path}" ]] && break
    path="${parent}"
  done
fi
while read -r unit _; do
  [[ -n "${unit}" ]] || continue
  add_candidate "$(systemctl show "${unit}" --property=WorkingDirectory --value 2>/dev/null || true)"
done < <(systemctl list-unit-files 'actions.runner.*.service' --no-legend --no-pager 2>/dev/null || true)

if (( ${#candidates[@]} == 0 )); then
  printf 'no runner root found from RUNNER_TEMP, RUNNER_WORKSPACE, or actions.runner.*.service\n' >&2
  exit 1
fi
if (( ${#candidates[@]} > 1 )); then
  printf 'ambiguous runner roots; refusing activation:\n' >&2
  printf '  %s\n' "${candidates[@]}" >&2
  exit 1
fi
runner_root="${candidates[0]}"

case "$(uname -m)" in
  x86_64) ARCH=amd64 ;;
  aarch64|arm64) ARCH=arm64 ;;
  *) printf 'unsupported architecture: %s\n' "$(uname -m)" >&2; exit 1 ;;
esac
archive="node_exporter-${VERSION}.linux-${ARCH}.tar.gz"
work_dir="$(mktemp -d)"
trap 'rm -rf -- "${work_dir}"' EXIT

curl --fail --location \
  --output "${work_dir}/${archive}" \
  "https://github.com/prometheus/node_exporter/releases/download/v${VERSION}/${archive}"
curl --fail --location \
  --output "${work_dir}/sha256sums.txt" \
  "https://github.com/prometheus/node_exporter/releases/download/v${VERSION}/sha256sums.txt"
mapfile -t checksums < <(grep " ${archive}$" "${work_dir}/sha256sums.txt")
if (( ${#checksums[@]} != 1 )); then
  printf 'expected one checksum for %s, found %s\n' "${archive}" "${#checksums[@]}" >&2
  exit 1
fi
printf '%s\n' "${checksums[0]}" > "${work_dir}/${archive}.sha256"
(
  cd "${work_dir}"
  sha256sum --check "${archive}.sha256"
  tar -xzf "${archive}"
)

id -u node_exporter >/dev/null 2>&1 ||
  sudo useradd --system --no-create-home --shell /usr/sbin/nologin node_exporter
sudo install -o root -g root -m 0755 \
  "${work_dir}/node_exporter-${VERSION}.linux-${ARCH}/node_exporter" \
  /usr/local/bin/node_exporter
sudo install -o root -g root -m 0755 \
  "${SCRIPT_DIR}/collect-runner-directory-metrics.sh" \
  /usr/local/bin/github-actions-runner-directory-metrics
sudo install -d -o root -g root -m 0755 /etc/node_exporter
sudo install -d -o root -g node_exporter -m 0755 /var/lib/node_exporter/textfile
printf 'TAILSCALE_IP=%s\n' "${TAILSCALE_IP}" | sudo tee /etc/node_exporter/environment >/dev/null
printf '%s\n' "${runner_root}" | sudo tee /etc/node_exporter/runner-root >/dev/null
sudo chmod 0644 /etc/node_exporter/environment
sudo chmod 0600 /etc/node_exporter/runner-root

cat > "${work_dir}/node_exporter.service" <<'UNIT'
[Unit]
Description=Prometheus node exporter
After=network-online.target tailscaled.service
Wants=network-online.target

[Service]
User=node_exporter
Group=node_exporter
EnvironmentFile=/etc/node_exporter/environment
ExecStart=/usr/local/bin/node_exporter --web.listen-address=${TAILSCALE_IP}:9100 --collector.textfile.directory=/var/lib/node_exporter/textfile
Restart=on-failure
RestartSec=5s
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
PrivateDevices=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictSUIDSGID=true
LockPersonality=true
CapabilityBoundingSet=

[Install]
WantedBy=multi-user.target
UNIT

cat > "${work_dir}/github-actions-runner-directory-metrics.service" <<'UNIT'
[Unit]
Description=Export GitHub Actions runner directory sizes for node_exporter

[Service]
Type=oneshot
ExecStart=/usr/local/bin/github-actions-runner-directory-metrics
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=read-only
PrivateTmp=true
PrivateDevices=true
ProtectKernelTunables=true
ProtectKernelModules=true
ProtectControlGroups=true
RestrictSUIDSGID=true
LockPersonality=true
CapabilityBoundingSet=CAP_DAC_READ_SEARCH
ReadWritePaths=/var/lib/node_exporter/textfile
UNIT

cat > "${work_dir}/github-actions-runner-directory-metrics.timer" <<'UNIT'
[Unit]
Description=Collect GitHub Actions runner directory sizes every five minutes

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
AccuracySec=30s
Persistent=true
Unit=github-actions-runner-directory-metrics.service

[Install]
WantedBy=timers.target
UNIT

sudo install -o root -g root -m 0644 "${work_dir}/node_exporter.service" \
  /etc/systemd/system/node_exporter.service
sudo install -o root -g root -m 0644 \
  "${work_dir}/github-actions-runner-directory-metrics.service" \
  /etc/systemd/system/github-actions-runner-directory-metrics.service
sudo install -o root -g root -m 0644 \
  "${work_dir}/github-actions-runner-directory-metrics.timer" \
  /etc/systemd/system/github-actions-runner-directory-metrics.timer

sudo systemctl daemon-reload
sudo systemctl enable node_exporter.service github-actions-runner-directory-metrics.timer
sudo systemctl restart node_exporter.service
sudo systemctl start github-actions-runner-directory-metrics.service
sudo systemctl restart github-actions-runner-directory-metrics.timer

printf 'node_exporter %s configured on %s with runner root %s\n' \
  "${VERSION}" "${TAILSCALE_IP}" "${runner_root}"
