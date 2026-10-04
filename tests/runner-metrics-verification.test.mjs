import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const verifier = fileURLToPath(new URL('../scripts/verify-runner-metrics.py', import.meta.url));
const metric = (path, value) => `github_actions_runner_directory_bytes{path="${path}"} ${value}\n`;
const verify = (input) => spawnSync(process.platform === 'win32' ? 'python' : 'python3', [verifier], {
  input,
  encoding: 'utf8',
});

test('runner metric verification accepts finite nonnegative Prometheus numbers', async () => {
  const workflow = await readFile(new URL('../.github/workflows/runner-maintenance.yml', import.meta.url), 'utf8');
  assert.match(workflow, /python3 scripts\/verify-runner-metrics\.py/);
  for (const [diag, work] of [['2.313946e+06', '6.96764555e+08'], ['0', '11'], ['+1.5E3', '.25']]) {
    const samples = metric('_diag', diag) + metric('_work', work);
    const result = verify('# HELP unrelated comment\nnode_other 7\n' + samples);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.replaceAll('\r\n', '\n'), samples);
  }
});

test('runner metric verification rejects missing, duplicate, malformed and invalid samples', () => {
  const valid = metric('_diag', '12') + metric('_work', '11');
  const invalid = [
    '', metric('_diag', '12'), metric('_work', '11'),
    metric('_diag', '12') + metric('_diag', '11'),
    valid + metric('_diag', '12'), valid + metric('_work', '11'),
    valid + metric('other', '1'),
    valid.replace('path="_work"', 'path="_work",extra="x"'),
    valid.replace('path="_work"', 'path="_work'),
    valid.replace('} 11', '} 11 123'),
  ];
  for (const value of ['-1', 'NaN', '+Inf', '-Inf', '1e999', 'abc', '1e', '0x10', '']) {
    for (const path of ['_diag', '_work']) {
      invalid.push(metric(path, value) + metric(path === '_diag' ? '_work' : '_diag', '11'));
    }
  }
  for (const samples of invalid) {
    const result = verify(samples);
    assert.equal(result.status, 1, `must reject ${JSON.stringify(samples)}: ${result.stderr}`);
    assert.equal(result.stdout, '', 'failed verification must not print partial success');
  }
});
