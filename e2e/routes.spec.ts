import { test, expect } from "@playwright/test";

test.describe("App shell routes", () => {
  test("navigates to /claims and shows Claims page", async ({ page }) => {
    await page.goto("/claims");
    await expect(page.getByRole("heading", { name: "Claims" })).toBeVisible();
  });

  test("navigates to /plans and shows Plans page", async ({ page }) => {
    await page.goto("/plans");
    await expect(page.getByRole("heading", { name: "Plans" })).toBeVisible();
  });

  test("navigates to /settings and shows Settings page", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  });
});
