import { test, expect } from '@playwright/test';

test.describe('Authentication and Portal Flows', () => {

  test('Student login and dashboard access', async ({ page, context }) => {
    await context.clearCookies();
    page.on('response', resp => {
      if (resp.status() >= 400) {
        console.log(`HTTP ${resp.status()} ERROR URL: ${resp.url()}`);
      }
    });

    await page.goto('/login');
    await page.fill('#email', 'student@platform.edu');
    await page.fill('#password', 'StudentPassword123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*student\/dashboard/, { timeout: 10000 });
  });
});
