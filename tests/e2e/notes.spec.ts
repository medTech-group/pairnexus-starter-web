import { expect, test } from "@playwright/test";

// Made-up text only: real notes are private.
test("adds a note and finds it listed", async ({ page }, testInfo) => {
  const text = `Pick up the blue umbrella (${testInfo.project.name} ${Date.now()})`;

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();

  await page.getByLabel("New note").fill(text);
  await page.getByRole("button", { name: "Save note" }).click();

  const list = page.getByRole("list", { name: "Your notes" });
  await expect(list.getByText(text)).toBeVisible();
  await expect(page.getByLabel("New note")).toHaveValue("");

  // It was saved, not only shown: it is still there after a reload.
  await page.reload();
  await expect(page.getByRole("list", { name: "Your notes" }).getByText(text)).toBeVisible();
});

test("refuses an empty note with a plain message", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("New note").fill("   ");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByRole("alert")).toHaveText("Write something before saving the note.");
});
