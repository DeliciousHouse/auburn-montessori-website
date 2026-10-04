// Run against a running preview: node scripts/check-calendar-viewer.mjs http://localhost:4321
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: true });
try {
  for (const [width, height] of [[1440, 1000], [390, 844]]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, isMobile: width < 500, hasTouch: width < 500 });
    await page.goto(new URL('/calendar', process.argv[2] || 'http://localhost:4321').href, { waitUntil: 'networkidle0' });
    const tabs = (await browser.pages()).length;
    await page.evaluate(() => document.documentElement.style.scrollBehavior = 'auto');
    await page.locator('a[href="#calendar-preview"]').click();
    await page.waitForFunction(() => location.hash === '#calendar-preview');
    assert.equal((await browser.pages()).length, tabs);
    assert(await page.$eval('a[download]', el => {
      const r = el.getBoundingClientRect();
      return document.elementFromPoint(r.x + r.width / 2, r.y + 2)?.closest('a') === el;
    }), 'View must leave the download button below the sticky header');
    await page.locator('#calendar-preview input').click();
    assert(await page.$eval('#calendar-preview img', img => img.getBoundingClientRect().width >= 1024));
    assert(await page.evaluate(w => document.documentElement.scrollWidth <= w, width), 'enlargement must not widen the page');
    assert(await page.$eval('#calendar-preview', el => el.textContent.includes('scroll sideways')));
    assert(await page.$eval('#calendar-preview [role="region"]', el => {
      el.scrollTop = el.scrollHeight;
      el.scrollLeft = el.scrollWidth;
      return el.scrollTop > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && el.scrollLeft > 0;
    }), 'last page and right edge must be reachable');
    console.log(`PASS calendar viewer ${width}x${height}`);
    await page.close();
  }
} finally {
  await browser.close();
}
