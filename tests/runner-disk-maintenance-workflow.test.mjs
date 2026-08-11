import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const maintenanceWorkflowPath = new URL(
  '../.github/workflows/runner-maintenance.yml',
  import.meta.url,
);
const deployWorkflowPath = new URL('../.github/workflows/deploy.yml', import.meta.url);

async function readWorkflow(path) {
  return readFile(path, 'utf8').catch(() => '');
}

test('runner maintenance is manual, weekly, nonfatal, and preserves live Docker data', async () => {
  const workflow = await readWorkflow(maintenanceWorkflowPath);

  assert.match(workflow, /^name: Runner Maintenance$/m);
  assert.match(workflow, /^  workflow_dispatch:$/m);
  assert.match(workflow, /^  schedule:$/m);
  assert.match(workflow, /^    - cron: ['"]\d+ \d+ \* \* \d['"]$/m);
  assert.match(workflow, /^    runs-on: self-hosted$/m);
  assert.match(workflow, /Before cleanup[\s\S]*?df -h \|\| true/);
  assert.match(
    workflow,
    /docker image prune -af --filter "until=168h" \|\| true/,
  );
  assert.match(
    workflow,
    /docker builder prune -af --filter "until=168h" \|\| true/,
  );
  assert.match(workflow, /docker container prune -f \|\| true/);
  assert.match(
    workflow,
    /find "\$\{runner_root\}\/\_diag"[\s\S]*?-type f[\s\S]*?-mtime \+7[\s\S]*?-delete[\s\S]*?\|\| true/,
  );
  assert.match(
    workflow,
    /find "\$\{work_root\}"[\s\S]*?-mindepth 1[\s\S]*?-maxdepth 1[\s\S]*?-type d[\s\S]*?-mtime \+7[\s\S]*?! -path "\$\{RUNNER_WORKSPACE\}"[\s\S]*?-exec rm -rf -- \{\} \+[\s\S]*?\|\| true/,
  );
  assert.match(workflow, /After cleanup[\s\S]*?df -h \|\| true/);
  assert.doesNotMatch(
    workflow,
    /docker (?:volume|system|network) prune|docker compose (?:down|rm)|docker (?:stop|kill|rm)\b/,
  );
});

test('deploy reclaims stale Docker artifacts before enforcing the 20 GB floor', async () => {
  const workflow = await readWorkflow(deployWorkflowPath);
  const cleanupStart = workflow.indexOf('- name: Reclaim stale Docker artifacts');
  const preflightStart = workflow.indexOf('- name: Verify at least 20 GB is free');
  const checkoutStart = workflow.indexOf('- name: Checkout');

  assert.notEqual(cleanupStart, -1, 'deploy is missing disk hygiene');
  assert.notEqual(preflightStart, -1, 'deploy is missing the disk preflight');
  assert.ok(cleanupStart < preflightStart, 'cleanup must precede the free-space check');
  assert.ok(preflightStart < checkoutStart, 'the free-space check must precede checkout/build work');

  const cleanup = workflow.slice(cleanupStart, preflightStart);
  assert.match(cleanup, /docker image prune -af --filter "until=168h" \|\| true/);
  assert.match(cleanup, /docker builder prune -af --filter "until=168h" \|\| true/);
  assert.match(cleanup, /docker container prune -f \|\| true/);
  assert.doesNotMatch(cleanup, /docker (?:volume|system|network) prune/);

  const preflight = workflow.slice(preflightStart, checkoutStart);
  assert.match(preflight, /MIN_FREE_GB=20/);
  assert.match(preflight, /docker info --format ['"]\{\{\.DockerRootDir\}\}['"]/);
  assert.match(preflight, /df -Pk "\$\{docker_root\}"/);
  assert.match(preflight, /exit 1/);
});
