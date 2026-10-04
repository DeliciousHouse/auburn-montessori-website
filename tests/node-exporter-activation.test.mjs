import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const collectorPath = fileURLToPath(
  new URL('../scripts/collect-runner-directory-metrics.sh', import.meta.url),
);
const installerPath = fileURLToPath(
  new URL('../scripts/install-node-exporter.sh', import.meta.url),
);
const workflowPath = new URL('../.github/workflows/runner-maintenance.yml', import.meta.url);

async function readOrEmpty(path) {
  return readFile(path, 'utf8').catch(() => '');
}

test('runner directory collector atomically writes exact byte gauges', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'runner metrics '));
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(join(root, '_diag', 'nested'), { recursive: true });
  await mkdir(join(root, '_work', 'repo'), { recursive: true });
  await writeFile(join(root, '_diag', 'worker.log'), Buffer.alloc(5, 'd'));
  await writeFile(join(root, '_diag', 'nested', 'job.log'), Buffer.alloc(7, 'j'));
  await writeFile(join(root, '_work', 'repo', 'artifact'), Buffer.alloc(11, 'w'));
  await writeFile(join(root, '_work', 'repo', 'empty'), '');

  const outputDirectory = join(root, 'textfile output');
  const result = spawnSync('bash', [collectorPath], {
    encoding: 'utf8',
    env: {
      ...process.env,
      RUNNER_ROOT: root,
      TEXTFILE_COLLECTOR_DIR: outputDirectory,
    },
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    await readFile(join(outputDirectory, 'github-actions-runner.prom'), 'utf8'),
    'github_actions_runner_directory_bytes{path="_diag"} 12\n' +
      'github_actions_runner_directory_bytes{path="_work"} 11\n',
  );
  assert.deepEqual(await readdir(outputDirectory), ['github-actions-runner.prom']);

  const lastGoodMetrics = await readFile(join(outputDirectory, 'github-actions-runner.prom'), 'utf8');
  await writeFile(join(root, '_diag', 'worker.log'), Buffer.alloc(17, 'd'));
  for (const directory of ['_diag', '_work']) {
    const failed = spawnSync('bash', ['-c', `
      find() {
        command find "$@"
        if [[ "$1" == */"$FAIL_DIRECTORY" ]]; then
          printf 'directory scan failed\\n' >&2
          return 1
        fi
      }
      export -f find
      bash "$1"
    `, 'collector-failure-test', collectorPath], {
      encoding: 'utf8',
      env: {
        ...process.env,
        RUNNER_ROOT: root,
        TEXTFILE_COLLECTOR_DIR: outputDirectory,
        FAIL_DIRECTORY: directory,
      },
    });
    assert.notEqual(failed.status, 0, `a failed ${directory} scan must fail collection`);
    assert.match(failed.stderr, /directory scan failed/);
    assert.equal(await readFile(join(outputDirectory, 'github-actions-runner.prom'), 'utf8'), lastGoodMetrics);
    assert.deepEqual(await readdir(outputDirectory), ['github-actions-runner.prom']);
  }
});

test('activation stays pinned, private, hardened, idempotent, and observable', async () => {
  const [collector, installer, workflow] = await Promise.all([
    readOrEmpty(collectorPath),
    readOrEmpty(installerPath),
    readOrEmpty(workflowPath),
  ]);

  for (const script of [collectorPath, installerPath]) {
    const syntax = spawnSync('bash', ['-n', script], { encoding: 'utf8' });
    assert.equal(syntax.status, 0, syntax.stderr);
  }

  assert.match(installer, /^VERSION=1\.12\.1$/m);
  assert.match(installer, /sha256sums\.txt/);
  assert.match(installer, /sha256sum --check/);
  assert.match(installer, /--web\.listen-address=\$\{TAILSCALE_IP\}:9100/);
  assert.match(
    installer,
    /--collector\.textfile\.directory=\/var\/lib\/node_exporter\/textfile/,
  );
  assert.match(installer, /^NoNewPrivileges=true$/m);
  assert.match(installer, /^ProtectSystem=strict$/m);
  assert.match(installer, /^ProtectHome=true$/m);
  assert.match(installer, /^OnUnitActiveSec=5min$/m);
  assert.match(
    installer,
    /install -d -o root -g node_exporter -m 0755 \/var\/lib\/node_exporter\/textfile/,
  );
  assert.match(installer, /^CapabilityBoundingSet=CAP_DAC_READ_SEARCH$/m);
  assert.match(installer, /RUNNER_TEMP/);
  assert.match(installer, /actions\.runner\.\*\.service/);
  assert.match(installer, /ambiguous runner roots/);
  assert.doesNotMatch(installer, /\/home\/(?:actions|ubuntu|bkam)\b/);

  assert.match(workflow, /^\s+TAILSCALE_IP: 100\.110\.92\.60$/m);
  assert.match(workflow, /bash scripts\/install-node-exporter\.sh/);
  assert.match(workflow, /systemctl is-active node_exporter/);
  assert.match(workflow, /ss -H -ltnp/);
  assert.match(workflow, /curl --fail --silent "http:\/\/\$\{TAILSCALE_IP\}:9100\/metrics"/);
  assert.match(workflow, /python3 scripts\/verify-runner-metrics\.py/);
  assert.doesNotMatch(
    workflow,
    /docker (?:volume|system|network) prune|docker compose (?:down|rm)|docker (?:stop|kill|rm)\b/,
  );

  assert.match(collector, /mktemp/);
  assert.match(collector, /mv -f/);
});

test('activation refuses unsafe addresses and ambiguous runner roots before any writes', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'runner discovery '));
  t.after(() => rm(root, { recursive: true, force: true }));
  const otherRoot = join(root, 'other runner');
  for (const candidate of [root, otherRoot]) {
    await mkdir(join(candidate, '_diag'), { recursive: true });
    await mkdir(join(candidate, '_work', '_temp'), { recursive: true });
  }

  const run = (address, serviceRoot) => spawnSync('bash', ['-c', `
    ip() { printf '1: tailscale0 inet 100.110.92.60/32 scope global tailscale0\\n'; }
    systemctl() {
      case "$1" in
        list-unit-files) printf 'actions.runner.test.service enabled\\n' ;;
        show) printf '%s\\n' "$SERVICE_ROOT" ;;
        *) printf 'unexpected systemctl mutation\\n' >&2; return 99 ;;
      esac
    }
    curl() { printf 'unexpected download\\n' >&2; return 99; }
    sudo() { printf 'unexpected privilege escalation\\n' >&2; return 99; }
    export -f ip systemctl curl sudo
    bash "$1"
  `, 'installer-guard-test', installerPath], {
    encoding: 'utf8',
    env: {
      ...process.env,
      TAILSCALE_IP: address,
      RUNNER_TEMP: join(root, '_work', '_temp'),
      RUNNER_WORKSPACE: join(root, '_work'),
      SERVICE_ROOT: serviceRoot,
    },
  });

  for (const address of ['', '0.0.0.0', '::', '203.0.113.10']) {
    const result = run(address, root);
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /refusing public or unexpected bind address/);
    assert.doesNotMatch(result.stderr, /unexpected (download|privilege|systemctl)/);
  }
  const ambiguous = run('100.110.92.60', otherRoot);
  assert.equal(ambiguous.status, 1, ambiguous.stderr);
  assert.match(ambiguous.stderr, /ambiguous runner roots/);
  assert.match(ambiguous.stderr, /other runner/);
  assert.equal(ambiguous.stderr.trim().split('\n').length, 3, 'both candidate paths are printed');
  assert.doesNotMatch(ambiguous.stderr, /unexpected (download|privilege|systemctl)/);
  for (const candidate of [root, otherRoot]) {
    assert.ok((await readdir(candidate)).includes('_diag'));
    assert.ok((await readdir(candidate)).includes('_work'));
  }
});
