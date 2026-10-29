import { expect, type Page, test } from "@playwright/test";

// Made-up text only: real notes are private.

async function openNotes(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
  // Wait for the list to load, so a note saved now isn't raced by it.
  await expect(page.getByText("Loading your notes…")).toBeHidden();
}

test("adds a note and finds it listed", async ({ page }, testInfo) => {
  const text = `Pick up the blue umbrella (${testInfo.project.name} ${Date.now()})`;

  await openNotes(page);
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
  await openNotes(page);
  await page.getByLabel("New note").fill("   ");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByRole("alert")).toHaveText("Write something before saving the note.");
});

test("stops typing at 5000 characters", async ({ page }) => {
  await openNotes(page);
  await page.getByLabel("New note").fill("a".repeat(5001));
  await expect(page.getByLabel("New note")).toHaveValue("a".repeat(5000));
});

test("answers an unknown API address with a plain 404, not the page", async ({ request }) => {
  for (const path of ["/api", "/api/nothing-here"]) {
    const res = await request.get(path);
    expect(res.status()).toBe(404);
    expect(await res.json()).toEqual({ error: "Not found." });
  }
});

test("after saving, says so and is ready for the next note", async ({ page }) => {
  await openNotes(page);
  await page.getByLabel("New note").fill("Made-up note to check the focus");
  await page.getByRole("button", { name: "Save note" }).press("Enter");
  await expect(page.getByRole("status")).toHaveText("Note saved.");
  await expect(page.getByLabel("New note")).toBeFocused();
});

test("keeps the note's text from changing while it is being saved", async ({ page }) => {
  let release!: () => void;
  const released = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/api/notes", async (route) => {
    if (route.request().method() === "POST") await released;
    await route.continue();
  });

  await openNotes(page);
  await page.getByLabel("New note").fill("Made-up slow note");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByRole("button", { name: "Saving…" })).toBeVisible();
  await expect(page.getByLabel("New note")).not.toBeEditable();
  release();
  await expect(page.getByRole("status")).toHaveText("Note saved.");
});

test("says plainly when the server can't be reached", async ({ page }) => {
  await page.route("**/api/notes", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByRole("alert")).toHaveText(
    "Your notes couldn't be loaded. Check your connection and try again.",
  );
  await page.getByLabel("New note").fill("Made-up note while offline");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "saved" })).toHaveText(
    "The note couldn't be saved. Check your connection and try again.",
  );
});

test("shows every note again after saving, even if the list failed to load at first", async ({ page }, testInfo) => {
  const earlier = `Made-up earlier note (${testInfo.project.name} ${Date.now()})`;
  await openNotes(page);
  await page.getByLabel("New note").fill(earlier);
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByRole("status")).toHaveText("Note saved.");

  let failed = false;
  await page.route("**/api/notes", async (route) => {
    if (route.request().method() === "GET" && !failed) {
      failed = true;
      await route.fulfill({ status: 500, json: { error: "Something went wrong. Please try again." } });
    } else {
      await route.continue();
    }
  });
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("Your notes couldn't be loaded");

  await page.getByLabel("New note").fill("Made-up later note");
  await page.getByRole("button", { name: "Save note" }).click();
  const list = page.getByRole("list", { name: "Your notes" });
  await expect(list.getByText(earlier)).toBeVisible();
  await expect(list.getByText("Made-up later note").first()).toBeVisible();
});
