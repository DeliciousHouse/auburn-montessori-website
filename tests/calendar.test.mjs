import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('calendar shows every PDF page inline and keeps the original download', async () => {
  const page = await readFile(new URL('../src/pages/calendar.astro', import.meta.url), 'utf8');
  const calendar = JSON.parse(await readFile(new URL('../src/data/calendar.json', import.meta.url), 'utf8'));

  assert.match(page, /2026–2027 General School Calendar \(PDF\)/);
  assert.match(page, /<a\b[^>]*href=\{calendar\.pdfPath\}[^>]*\bdownload[^>]*>[\s\S]*?Download Calendar PDF\s*<\/a>/);
  assert.match(page, /<a\b[^>]*href="#calendar-preview"[^>]*>\s*View Calendar\s*<\/a>/);
  assert.doesNotMatch(page, /target="_blank"|new tab/);
  assert.match(page, /id="calendar-preview"/);
  assert.match(page, /<img\b[^>]*src="\/documents\/calendar-preview.svg"/);
  const preview = await readFile(new URL('../public/documents/calendar-preview.svg', import.meta.url), 'utf8');
  assert.equal((preview.match(/<svg\b/g) ?? []).length, 6, 'all five PDF pages plus the outer SVG');
  assert.match(preview, /29f94f3cb42422d7915b830baee1a57616e9601f6153439f0ce99615008bf784/);
  assert.equal(calendar.pdfPath, '/documents/calendar.pdf');

  const pdf = await readFile(new URL(`../public${calendar.pdfPath}`, import.meta.url));
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.equal(createHash('sha256').update(pdf).digest('hex'), '29f94f3cb42422d7915b830baee1a57616e9601f6153439f0ce99615008bf784');
});
