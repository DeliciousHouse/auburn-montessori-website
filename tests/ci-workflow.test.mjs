import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const workflowPath = new URL('../.github/workflows/ci.yml', import.meta.url);

test('CI validates pull requests and pushes to main on Node 24', async () => {
  const workflow = await readFile(workflowPath, 'utf8');

  assert.match(workflow, /^name: CI$/m);
  assert.match(workflow, /^on:$/m);
  assert.match(workflow, /^  pull_request:$/m);
  assert.match(workflow, /^  push:$/m);
  assert.match(workflow, /^    branches: \[main\]$/m);
  assert.match(workflow, /^    runs-on: ubuntu-latest$/m);
  assert.match(workflow, /uses: actions\/checkout@v4/);
  assert.match(workflow, /uses: actions\/setup-node@v4/);
  assert.match(workflow, /node-version: 24/);
  assert.match(workflow, /cache: npm/);
  assert.match(workflow, /run: npm ci/);
  assert.match(workflow, /run: npm test/);
  assert.match(workflow, /run: npm run check/);
  assert.match(workflow, /run: npm run build/);
});
