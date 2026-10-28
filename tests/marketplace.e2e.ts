import { test } from "@e2e-dev/web";
import { expect } from "e2e";

test("buyer explores Cirebon food rescue catalog and views active surprise bags", async ({
  app,
  screen,
}) => {
  await app.open("/");

  // 1. Verify impact ticker and header are rendered
  await expect(screen.getByText("Dampak Cirebon:")).toBeVisible();

  // 2. Verify categories are displayed
  await expect(screen.getByText("Semua Kategori")).toBeVisible();
});
