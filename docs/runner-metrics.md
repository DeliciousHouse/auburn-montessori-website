# ubuntu-ams runner metrics (GEN-39)

The existing **Runner Maintenance** workflow owns activation. Do not add another workflow, scheduler, dispatcher, public proxy, or firewall opening. The exporter is pinned to node_exporter v1.12.1, verified against the release's SHA-256 manifest, and listens only on `100.110.92.60:9100`. Its hardened systemd service reads the textfile collector directory; one oneshot collector and its five-minute timer publish:

```text
github_actions_runner_directory_bytes{path="_diag"} <bytes>
github_actions_runner_directory_bytes{path="_work"} <bytes>
```

Bytes are the sum of regular-file logical lengths, including nested files, not allocated disk blocks. Symlinks are not followed; empty directories report zero. Publication is one atomic rename after both scans succeed. A failed scan preserves the last successful file and fails the oneshot; do not treat an old sample as a current measurement. Inspect the collector service/journal and `node_textfile_mtime_seconds` when diagnosing stale data.

## Bounded activation, after review and merge

1. Confirm the selected self-hosted runner is `ubuntu-ams` and owns `100.110.92.60`. Coordinate with deploys/other host maintenance before running. The installer refuses a different address and refuses zero or multiple runner roots discovered from `RUNNER_TEMP`, `RUNNER_WORKSPACE`, and installed `actions.runner.*.service` working directories. Multiple candidates are printed; resolve the installed runner context, never guess a home path or delete candidates.
2. Confirm the host operator has provisioned the approved non-interactive elevation path for this installer. Prior runs `31541994163` and `32003854333` failed because the Actions account required a sudo password. Merging this PR does not grant access. Do not put a password in Actions, loosen sudoers to `NOPASSWD: ALL`, or use Docker to bypass the privilege boundary. If access remains unavailable, stop and return the access prerequisite to the existing activation lane.
3. From the reviewed default branch, dispatch the existing workflow once:

   ```bash
   gh workflow run runner-maintenance.yml --repo DeliciousHouse/auburn-montessori-website --ref main
   ```

   This also runs the already-reviewed cleanup: old unused images/build cache, stopped containers, stale runner diagnostics and inactive workspaces. It must not delete volumes, running containers, runner registration, or credentials. Weekly scheduled runs stay cleanup-only. Merge alone does not activate metrics (the repository's existing website deploy still runs on pushes to main).
4. Record the exact run ID and inspect its result. It must show before/after `df`, enabled/active exporter and timer, only `100.110.92.60:9100` from `ss`, both gauges from local `/metrics`, and identical protected Docker snapshots. An unsuccessful install is not activation evidence. Installation is repeatable: it overwrites the same managed binaries/config/units, restarts the exporter and timer, and starts a fresh collection; it does not create parallel services.
5. In the downstream host-activation lane, record a restart-safe check and private reachability:

   ```bash
   sudo -n systemctl restart node_exporter.service
   systemctl is-active node_exporter.service
   systemctl is-enabled node_exporter.service github-actions-runner-directory-metrics.timer
   sudo -n systemctl start github-actions-runner-directory-metrics.service
   systemctl is-active github-actions-runner-directory-metrics.timer
   sudo -n ss -H -ltnp 'sport = :9100'
   curl --fail --silent --show-error http://100.110.92.60:9100/metrics
   df -h
   ```

   Repeat the curl from the authorized Tailnet monitoring host. Reject any wildcard/public listener or missing/duplicate directory gauge. Keep credentials and unrelated metric content out of card evidence; retain the two gauges, listener, service state and disk summary only. Central Prometheus/alert routing belongs to the existing follow-up, not this installer.

## Rollback / failed activation

Using the approved host privilege path, stop monitoring without touching the website, runner, or Docker data:

```bash
sudo -n systemctl disable --now github-actions-runner-directory-metrics.timer
sudo -n systemctl stop github-actions-runner-directory-metrics.service
sudo -n systemctl disable --now node_exporter.service
sudo -n ss -H -ltnp 'sport = :9100'
```

Confirm the managed service is inactive and its listener is gone. Leave installed files and the service account in place for diagnosis/retry; do not delete anything. If another process owns port 9100, report it rather than stopping unrelated services. Restore a previously approved installer revision through the same reviewed path if needed. Cleanup performed by Runner Maintenance is not reversible; do not dispatch it just to roll back monitoring.

## Local checks and handoff

Run `npm run verify`, `node --test tests/node-exporter-activation.test.mjs`, and on Linux `bash -n` and `shellcheck` for both metrics scripts. Parse workflow YAML and run `actionlint` on `.github/workflows/runner-maintenance.yml`. Tests use temporary directories and stub host commands; they do not install services or activate the real host.

GEN-39 implementation card: `t_9113b97f`; source/follow-up routing card: `t_cb6beb77`. Reuses the implementation merged in PR #38. The April-to-August incident interval was 122 days, but no April `df` baseline exists, so there is no defensible GB/day growth estimate. The dev-team lead, not dev-eng, owns Jira writes. Live activation and its evidence remain downstream of implementation and review.
