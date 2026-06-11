import { test, expect } from '@playwright/test';

test('debug console errors na raiz', async ({ page }) => {
  page.on('console', msg => {
    console.log(`[Browser Console - ${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', exception => {
    console.error(`[Browser Uncaught Exception] ${exception.stack}`);
  });

  try {
    await page.goto('/', { timeout: 15000 });
    await page.waitForTimeout(5000);
  } catch (err) {
    console.error(`[Navigation Error] ${err.message}`);
  }
});
