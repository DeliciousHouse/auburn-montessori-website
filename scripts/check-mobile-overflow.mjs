import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';

// Run against astro dev/preview or the deployed site. Uses the existing Puppeteer dependency.
const base = process.argv[2] ?? 'http://127.0.0.1:4321';
const output = process.argv[3];
const routes = ['/educators', '/', '/about', '/programs', '/admissions', '/fees-hours', '/contact', '/parent-resources', '/documents', '/calendar', '/montessori-work-cycle', '/personal-belongings-list'];
const results = [];
const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  for (const width of [320, 375, 390, 430, 1440]) {
    await page.setViewport({ width, height: width === 1440 ? 1000 : 844, isMobile: width < 640, deviceScaleFactor: 1 });
    for (const route of routes) {
      const response = await page.goto(new URL(route, base).href, { waitUntil: 'networkidle0' });
      assert.equal(response.status(), 200, route);
      await page.evaluate(() => document.fonts.ready);
      for (const menu of width === 1440 ? ['closed'] : ['closed', 'open']) {
        if (menu === 'open') {
          await page.click('#mobile-menu-toggle');
          await page.waitForFunction(() => document.querySelector('#mobile-menu-toggle').getAttribute('aria-expanded') === 'true');
        }
        const dimensions = await page.evaluate(() => ({
          client: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth,
          inner: window.innerWidth,
          clipped: [...document.querySelectorAll('article h3, article .badge')].filter(el => {
            const row = el.parentElement.getBoundingClientRect();
            const rect = el.getBoundingClientRect();
            return rect.left < row.left - 1 || rect.right > row.right + 1;
          }).map(el => el.textContent.trim())
        }));
        const result = { route, width, menu, ...dimensions };
        results.push(result);
        console.log(JSON.stringify(result));
        if (output && route === '/educators' && [390, 1440].includes(width)) {
          await mkdir(output, { recursive: true });
          // Load below-the-fold portraits before a full-page capture.
          await page.evaluate(async () => {
            const images = [...document.querySelectorAll('article img')];
            for (const image of images) {
              image.loading = 'eager';
              await image.decode();
            }
          });
          await page.screenshot({ path: resolve(output, `educators-${width}-${menu}.png`), fullPage: true });
        }
        assert.equal(dimensions.scroll, dimensions.client, `${route} ${width}px ${menu}: page overflow`);
        assert.equal(dimensions.inner, width, `${route}: viewport expanded`);
        // Mobile headers must expose all names/badges, not merely contain a scroll strip.
        if (width < 640) assert.deepEqual(dimensions.clipped, [], `${route}: header content outside row`);
      }
    }
  }
  console.log(`PASS: ${results.length} route/viewport/menu checks`);
} finally {
  if (output) {
    await mkdir(output, { recursive: true });
    await writeFile(resolve(output, 'overflow-results.json'), `${JSON.stringify({ base, results }, null, 2)}\n`);
  }
  await browser.close();
}
