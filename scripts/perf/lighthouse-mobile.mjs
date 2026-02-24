import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

const args = process.argv.slice(2);
const argMap = new Map();
for (let i = 0; i < args.length; i += 1) {
  const key = args[i];
  const value = args[i + 1];
  if (key?.startsWith('--') && value && !value.startsWith('--')) {
    argMap.set(key, value);
    i += 1;
  }
}

const url = argMap.get('--url') ?? process.env.PERF_URL ?? 'http://127.0.0.1:4321/';
const outputPath = resolve(argMap.get('--output') ?? process.env.PERF_OUTPUT ?? 'perf-results/lighthouse-mobile.json');
const summaryPath = resolve(
  argMap.get('--summary') ??
  process.env.PERF_SUMMARY ??
  outputPath.replace(/\.json$/i, '.summary.json')
);

await mkdir(dirname(outputPath), { recursive: true });
await mkdir(dirname(summaryPath), { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
});
const endpoint = browser.wsEndpoint();
const match = endpoint.match(/:(\d+)\//);
if (!match) {
  await browser.close();
  throw new Error(`Unable to parse browser port from wsEndpoint: ${endpoint}`);
}
const port = Number(match[1]);

const runner = await lighthouse(url, {
  port,
  output: 'json',
  onlyCategories: ['performance'],
  emulatedFormFactor: 'mobile',
  throttlingMethod: 'simulate',
  screenEmulation: {
    mobile: true,
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    disabled: false
  }
});

await browser.close();
if (!runner.report) {
  throw new Error('Lighthouse did not return a JSON report.');
}
await writeFile(outputPath, `${runner.report}\n`, 'utf8');

const raw = JSON.parse(await readFile(outputPath, 'utf8'));
const audits = raw.audits ?? {};

const summary = {
  url: raw.finalDisplayedUrl ?? raw.finalUrl ?? url,
  fetchTime: raw.fetchTime,
  performanceScore: typeof raw.categories?.performance?.score === 'number'
    ? Math.round(raw.categories.performance.score * 100)
    : null,
  lcpMs: audits['largest-contentful-paint']?.numericValue ?? null,
  cls: audits['cumulative-layout-shift']?.numericValue ?? null,
  inpMs: audits['interaction-to-next-paint']?.numericValue ?? null,
  ttfbMs: audits['server-response-time']?.numericValue ?? null,
  totalTransferBytes: audits['total-byte-weight']?.numericValue ?? null,
  requestCount: audits['network-requests']?.details?.items?.length ?? null
};

await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`Lighthouse JSON: ${outputPath}`);
console.log(`Summary JSON: ${summaryPath}`);
