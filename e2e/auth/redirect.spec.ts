import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Auth / Redirect", () => {
  test("redirects from / to /login", async ({ page }: any) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page).toHaveURL(/\/login$/);

    await expect(
      page.getByRole("heading", { name: /Content de vous revoir/i })
    ).toBeVisible();
  });
});
