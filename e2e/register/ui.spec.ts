import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:5173";

test.describe("Register / UI & validation", () => {
  test.beforeEach(async ({ page }: any) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(
      page.getByRole("heading", { name: /Créer un compte/i })
    ).toBeVisible();
    await expect(
      page.getByText(/Inscrivez-vous avec votre adresse e-mail/i)
    ).toBeVisible();
  });
});
