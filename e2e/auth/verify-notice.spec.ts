import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Auth / Verify Notice", () => {
  test("shows verify notice when notice=verify", async ({ page }: any) => {
    await page.goto(`${BASE_URL}/login?notice=verify`);
    await expect(
      page.getByText(/Veuillez vérifier votre e.?mail/i)
    ).toBeVisible();
  });
});
