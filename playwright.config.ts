import { defineConfig } from "@playwright/test";

// Las pruebas corren contra la web compilada (vite preview).
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4173/",
    launchOptions: { args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] },
  },
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    { name: "escritorio", use: { viewport: { width: 1440, height: 900 } } },
    { name: "tableta", use: { viewport: { width: 768, height: 1024 }, hasTouch: true } },
    {
      name: "movil",
      use: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true },
    },
  ],
});
