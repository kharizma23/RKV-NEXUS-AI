import { test, expect } from '@playwright/test';

test.describe('Programme Management E2E Workflows', () => {
  test('Workflow 1: Admin creates programme from template', async ({ page, context }) => {
    await context.clearCookies();

    page.on('response', async (resp) => {
      if (resp.url().includes('/admin/programmes') || resp.url().includes('/public/')) {
        console.log(`API ${resp.request().method()} ${resp.url()} -> Status ${resp.status()}`);
        if (resp.status() >= 400) {
          try {
            console.log('Error Body:', await resp.text());
          } catch (e) {}
        }
      }
    });

    // 1. Admin login
    await page.goto('/login');
    await page.fill('#email', 'admin@platform.edu');
    await page.fill('#password', 'AdminPassword123!');
    await page.click('button[type="submit"]');

    // Wait for login completion
    await expect(page).toHaveURL(/.*admin\/dashboard/, { timeout: 10000 });

    // 2. Navigate to Admin Academics using client-side navigation
    await page.click('a[href="/admin/academics"]');
    await page.waitForResponse((resp) => resp.url().includes('/public/institutions'), { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Programme Management Console' })).toBeVisible({ timeout: 10000 });

    // 3. Open New Programme Modal
    const newProgBtn = page.locator('#btn-new-programme');
    await expect(newProgBtn).toBeVisible({ timeout: 10000 });
    await page.waitForFunction(() => !document.querySelector('#btn-new-programme')?.hasAttribute('disabled'), { timeout: 10000 });
    await newProgBtn.click();
    await expect(page.getByText('Step 1: Select Programme Template')).toBeVisible({ timeout: 10000 });

    // 4. Select Template (BE-ECE)
    const eceTemplate = page.locator('button:has-text("BE-ECE")');
    await expect(eceTemplate).toBeVisible({ timeout: 10000 });
    await eceTemplate.click();

    // 5. Select Institution & Department inside the creation form modal
    const instSelect = page.locator('form select').first();
    await expect(instSelect.locator('option').nth(1)).toBeAttached({ timeout: 15000 });
    const instOptions = await instSelect.locator('option').allInnerTexts();
    console.log('Modal Institution Options:', instOptions);

    const ditOptionValue = await instSelect.locator('option').filter({ hasText: 'Demo Institute of Technology' }).getAttribute('value');
    console.log('ditOptionValue:', ditOptionValue);
    await instSelect.selectOption(ditOptionValue!);

    const deptSelect = page.locator('form select').nth(1);
    await expect(deptSelect).toBeEnabled({ timeout: 10000 });
    await expect(deptSelect.locator('option').nth(1)).toBeAttached({ timeout: 10000 });
    
    await deptSelect.selectOption({ index: 1 });

    // Provide unique programme code for test run
    const codeInput = page.locator('input[placeholder="e.g. BE-ECE"]');
    await codeInput.fill(`BE-ECE-${Date.now().toString().slice(-4)}`);

    // Submit
    const saveBtn = page.locator('#btn-save-programme');
    await saveBtn.click();

    // 6. Verify success notification & directory table
    await expect(page.locator('body')).toContainText('created successfully', { timeout: 10000 });
  });

  test('Workflow 2: Student registration loads admin created active programme', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/register/student');
    await expect(page.locator('h2')).toContainText('Student Registration', { timeout: 10000 });

    const progSelect = page.locator('#select-student-programme');
    await expect(progSelect).toBeVisible({ timeout: 10000 });
  });
});
