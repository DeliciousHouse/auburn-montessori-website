import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('calendar offers view and download links to the original 2026–2027 PDF', async () => {
  const page = await readFile(new URL('../src/pages/calendar.astro', import.meta.url), 'utf8');
  const calendar = JSON.parse(await readFile(new URL('../src/data/calendar.json', import.meta.url), 'utf8'));

  assert.match(page, /2026–2027 General School Calendar \(PDF\)/);
  assert.match(page, /<a\b[^>]*href=\{calendar\.pdfPath\}[^>]*\bdownload[^>]*>[\s\S]*?Download Calendar PDF\s*<\/a>/);
  assert.match(page, /<a\b[^>]*href=\{calendar\.pdfPath\}[^>]*target="_blank"[^>]*rel="noopener noreferrer"[^>]*>\s*View Calendar PDF \(new tab\)\s*<\/a>/);
  assert.equal(calendar.pdfPath, '/documents/calendar.pdf');

  const pdf = await readFile(new URL(`../public${calendar.pdfPath}`, import.meta.url));
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.equal(createHash('sha256').update(pdf).digest('hex'), '29f94f3cb42422d7915b830baee1a57616e9601f6153439f0ce99615008bf784');
});
