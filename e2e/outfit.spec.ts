import { expect, test, type Page } from "@playwright/test";

async function createOutfit(page: Page) {
  await page.goto("/");
  await page.getByRole("radio", { name: /running/i }).click();
  await page.getByRole("radio", { name: /mild/i }).click();
  await page.getByRole("radio", { name: /performance/i }).click();
  await page.getByRole("button", { name: /create my outfit/i }).click();
  await expect(
    page.getByRole("heading", { name: /your outfit is ready/i }),
  ).toBeVisible();
}

const parsePLN = (s: string) =>
  Math.round(parseFloat(s.replace(/[^\d,]/g, "").replace(",", ".")) * 100);

test("happy path: total equals the sum of card prices", async ({ page }) => {
  await createOutfit(page);
  const cards = page.locator("article");
  expect(await cards.count()).toBeGreaterThanOrEqual(3);
  const prices = await cards.locator("p.font-heading").allTextContents();
  const sum = prices.map(parsePLN).reduce((a, b) => a + b, 0);
  const total = await page.getByTestId("outfit-total").textContent();
  expect(parsePLN(total!)).toBe(sum);
});

test("replacing an item leaves the others untouched and updates the total", async ({
  page,
}) => {
  await createOutfit(page);
  const names = page.locator("article h2");
  const before = await names.allTextContents();
  const totalBefore = await page.getByTestId("outfit-total").textContent();

  await page.getByRole("button", { name: /change item/i }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: /^select /i }).first().click();
  await expect(dialog).toBeHidden();

  const after = await names.allTextContents();
  expect(after[0]).not.toBe(before[0]);
  expect(after.slice(1)).toEqual(before.slice(1));
  expect(await page.getByTestId("outfit-total").textContent()).not.toBe(totalBefore);
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("works on a phone without horizontal scroll", async ({ page }) => {
    await createOutfit(page);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
    await page.getByRole("button", { name: /generate another look/i }).click();
    await expect(page.locator("article").first()).toBeVisible();
  });
});
