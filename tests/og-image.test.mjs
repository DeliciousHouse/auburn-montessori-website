import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('og:image is a 1200x630 PNG that Layout points at', async () => {
  const png = await readFile(new URL('../public/images/brand/og-card.png', import.meta.url));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);

  const layout = await readFile(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
  assert.match(layout, /\/images\/brand\/og-card\.png/);
  assert.match(layout, /summary_large_image/);
});
