// e2e/auth.spec.ts
import { expect, test } from "@playwright/test";

const BASE_URL = 'http://localhost:5173';
const EMAIL = process.env.E2E_EMAIL ?? '';
const PASSWORD = process.env.E2E_PASSWORD ?? '';

test.describe("Auth / Login", () => {
  test("redirects from / to /login", async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page).toHaveURL(/\/login$/);

    // Title from your AuthTemplate
    await expect(
      page.getByRole("heading", { name: /Content de vous revoir/i })
    ).toBeVisible();
  });

  test("shows verify notice when notice=verify", async ({ page }) => {
    await page.goto(`${BASE_URL}/login?notice=verify`);
    await expect(
      page.getByText(/Veuillez vérifier votre e.?mail/i)
    ).toBeVisible();
  });

  test("logs in with provided credentials and lands on /", async ({ page }) => {
    // Handle possible window.alert() on login failure so test doesn't hang
    let sawErrorDialog = false;
    page.on("dialog", async (dialog) => {
      sawErrorDialog = true;
      await dialog.accept();
    });

    await page.goto(`${BASE_URL}/login`);

    // Fill email & password (tolerate NBSP / hyphen in labels/placeholder)
    await page.getByTestId("email").fill(EMAIL);
    await page.getByTestId("password").fill(PASSWORD);

    // Click submit
    await page.getByRole("button", { name: /Se connecter/i }).click();

    // Your login() does router.replace('/'); wait for navigation or error dialog
    // First, try to confirm success:
    const navigated = await Promise.race([
      page
        .waitForURL(`${BASE_URL}/`, { timeout: 10_000 })
        .then(() => true)
        .catch(() => false),
      (async () => {
        // give a small window for an error dialog to appear
        await page.waitForTimeout(1500);
        return false;
      })(),
    ]);

    if (!navigated && sawErrorDialog) {
      test.fail(true, "Login failed and an error dialog appeared.");
    } else {
      expect(navigated).toBeTruthy();
      await expect(page).toHaveURL(`${BASE_URL}/`);
    }
  });
});
