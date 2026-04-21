import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

function getChromiumExecutablePath() {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }

  const localAppData = process.env.LOCALAPPDATA;

  if (!localAppData) {
    return undefined;
  }

  const browsersRoot = join(localAppData, "ms-playwright");

  if (!existsSync(browsersRoot)) {
    return undefined;
  }

  const chromiumDirs = readdirSync(browsersRoot)
    .filter((entry) => /^chromium-\d+$/.test(entry))
    .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));

  for (const directory of chromiumDirs) {
    const executablePath = join(browsersRoot, directory, "chrome-win64", "chrome.exe");

    if (existsSync(executablePath)) {
      return executablePath;
    }
  }

  return undefined;
}

const chromiumExecutablePath = getChromiumExecutablePath();

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: chromiumExecutablePath
          ? {
              executablePath: chromiumExecutablePath,
            }
          : undefined,
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120000,
      },
});
