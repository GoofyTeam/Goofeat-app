import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Register / Link to login", () => {
  test("navigates to /login via the link", async ({ page }: any) => {
    await page.goto(`${BASE_URL}/register`);
    await page.getByRole("link", { name: /Se connecter/i }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
