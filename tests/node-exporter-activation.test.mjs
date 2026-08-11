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
  assert.match(workflow, /github_actions_runner_directory_bytes/);
  assert.doesNotMatch(
    workflow,
    /docker (?:volume|system|network) prune|docker compose (?:down|rm)|docker (?:stop|kill|rm)\b/,
  );

  assert.match(collector, /mktemp/);
  assert.match(collector, /mv -f/);
});
