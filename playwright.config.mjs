import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://127.0.0.1:3101",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node tests/fixtures/posts-server.mjs",
    url: "http://127.0.0.1:3101/login",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
