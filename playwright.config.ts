import { defineConfig, devices } from "@playwright/test";

// The browser check: build the page, run the Worker locally with Wrangler and a
// fresh local D1 database, then use the page as a person would. No Cloudflare
// account or token is needed.
const port = 8788;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: "list",
  use: { baseURL: `http://localhost:${port}` },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && rm -rf .wrangler/e2e && npm run db:migrate -- --persist-to .wrangler/e2e && wrangler dev --port ${port} --persist-to .wrangler/e2e`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { WRANGLER_SEND_METRICS: "false" },
  },
});
