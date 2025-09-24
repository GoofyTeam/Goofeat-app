// e2e/auth.spec.ts
import { expect, test } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Auth / Login', () => {
  test('redirects from / to /login', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page).toHaveURL(/\/login$/);

    // Title from your AuthTemplate
    await expect(
      page.getByRole('heading', { name: /Content de vous revoir/i })
    ).toBeVisible();
  });

  test('shows verify notice when notice=verify', async ({ page }) => {
    await page.goto(`${BASE_URL}/login?notice=verify`);
    await expect(
      page.getByText(/Veuillez vérifier votre e.?mail/i)
    ).toBeVisible();
  });
});
