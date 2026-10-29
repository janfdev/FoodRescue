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

test("seller can access surprise bag management dashboard and view bags", async ({
  app,
  screen,
}) => {
  await app.open("/seller/bags");

  // Verify seller bags page loaded
  await expect(screen.getByText("Manajemen Surprise Bag")).toBeVisible();
});

test("super admin can navigate to audit log page and view activity records", async ({
  app,
  screen,
}) => {
  await app.open("/admin/audit-logs");

  // Verify audit logs table or header rendered
  await expect(screen.getByText("Audit Log Aktivitas")).toBeVisible();
});
