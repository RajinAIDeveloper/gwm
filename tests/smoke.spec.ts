import { expect, test } from "@playwright/test";

const hasConfiguredSupabase =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_url" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_key";

const listingId = process.env.E2E_LISTING_ID;
const canOpenListingDetail = hasConfiguredSupabase && Boolean(listingId);

test.describe("lean MVP smoke", () => {
  test("anonymous users can access landing and auth entry points", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /move garment waste inventory into active supply instead of storage/i,
      }),
    ).toBeVisible();

    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: /sign in to garment waste marketplace/i })).toBeVisible();

    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { name: /create your marketplace account/i })).toBeVisible();
    await expect(page.locator('input[name="role"][value="seller"]')).toBeChecked();
    await expect(page.locator('input[name="role"][value="buyer"]')).toBeVisible();
  });

  test("anonymous users are redirected away from seller routes", async ({ page }) => {
    await page.goto("/seller");
    await page.waitForURL(/\/sign-in\?next=%2Fseller$/);
    await expect(page.getByRole("heading", { name: /sign in to garment waste marketplace/i })).toBeVisible();
  });

  test("public browse route is accessible when Supabase is configured", async ({ page }) => {
    test.skip(!hasConfiguredSupabase, "Supabase env is not configured for runtime route validation.");

    await page.goto("/browse");
    await expect(page.getByRole("heading", { name: /browse available garment waste stock/i })).toBeVisible();
  });

  test("public listing detail blocks anonymous inquiry submission when seeded data is available", async ({ page }) => {
    test.skip(!canOpenListingDetail, "Requires Supabase env plus E2E_LISTING_ID for a real public listing.");

    await page.goto(`/listings/${listingId}`);
    await expect(page.getByRole("heading", { name: /send inquiry/i })).toBeVisible();
    await expect(page.getByText(/buyer sign-in required/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in to inquire/i })).toBeVisible();
  });
});
