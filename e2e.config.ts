import type { E2EConfig } from "e2e";
import { web } from "@e2e-dev/web";

export default {
  tests: "tests/**/*.e2e.ts",
  targets: [
    {
      engine: web({
        browser: "chromium",
        viewport: { width: 390, height: 844 }, // Mobile viewport for Rerasa
      }),
      app: {
        url: "http://127.0.0.1:3000",
        command: {
          executable: "bun",
          args: ["run", "dev"],
          log: ".e2e/logs/app.log",
          reuseExisting: true,
        },
      },
    },
  ],
} satisfies E2EConfig;
