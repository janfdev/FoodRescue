import { chromium } from '/root/rerasa-motion/showcase-ui/node_modules/playwright-core';
import fs from 'fs';

interface MenuAudit {
  role: string;
  menuName: string;
  route: string;
  httpStatus: number;
  renderStatus: 'OK' | 'BROKEN';
  pageHeading: string;
  details: string;
}

const BASE_URL = 'https://rerasa.fizaa.me';

const ALL_ROUTES_TO_AUDIT: { role: string; menuName: string; path: string; needsAuthRole?: 'seller' | 'admin' }[] = [
  // BUYER & PUBLIC ROUTES
  { role: 'Buyer', menuName: 'Katalog Beranda', path: '/' },
  { role: 'Buyer', menuName: 'Keranjang Makanan', path: '/cart' },
  { role: 'Buyer', menuName: 'Checkout Pembayaran', path: '/checkout?bagId=bag-ruby-1' },
  { role: 'Buyer', menuName: 'Riwayat Pesanan & Tiket', path: '/history' },
  { role: 'Buyer', menuName: 'Ruang Chat Toko', path: '/chat?orderId=RB-7821' },
  { role: 'Buyer', menuName: 'Akun & Profil Pembeli', path: '/account' },
  { role: 'Buyer', menuName: 'Registrasi Mitra Baru', path: '/register-seller' },
  { role: 'Buyer', menuName: 'Portal Login', path: '/login' },
  { role: 'Buyer', menuName: 'Aset Brand & Logo', path: '/brand' },

  // SELLER SUB-MENUS
  { role: 'Seller', menuName: 'Kasir POS & Handover', path: '/seller', needsAuthRole: 'seller' },
  { role: 'Seller', menuName: 'Katalog Surprise Bag', path: '/seller/bags', needsAuthRole: 'seller' },
  { role: 'Seller', menuName: 'Tambah Menu Surplus', path: '/seller/bags/new', needsAuthRole: 'seller' },
  { role: 'Seller', menuName: 'Edit Menu Surplus', path: '/seller/bags/bag-ruby-1/edit', needsAuthRole: 'seller' },
  { role: 'Seller', menuName: 'Daftar Pesanan Toko', path: '/seller/orders', needsAuthRole: 'seller' },
  { role: 'Seller', menuName: 'Pengadaan Rescue Box', path: '/seller/boxes', needsAuthRole: 'seller' },
  { role: 'Seller', menuName: 'Keuangan & Saldo Toko', path: '/seller/finance', needsAuthRole: 'seller' },
  { role: 'Seller', menuName: 'Profil & Jam Operasional', path: '/seller/profile', needsAuthRole: 'seller' },

  // ADMIN SUB-MENUS
  { role: 'Admin', menuName: 'Action Center & Metrik', path: '/admin', needsAuthRole: 'admin' },
  { role: 'Admin', menuName: 'Master Paket Box B2B', path: '/admin/boxes', needsAuthRole: 'admin' },
  { role: 'Admin', menuName: 'Verifikasi KYC Mitra', path: '/admin/mitra', needsAuthRole: 'admin' },
  { role: 'Admin', menuName: 'Detail Tinjauan Mitra', path: '/admin/mitra/store-ruby-bakery', needsAuthRole: 'admin' },
  { role: 'Admin', menuName: 'Vault Escrow & Keuangan', path: '/admin/keuangan', needsAuthRole: 'admin' },
  { role: 'Admin', menuName: 'Audit Rating & Kemasan', path: '/admin/audit', needsAuthRole: 'admin' },
  { role: 'Admin', menuName: 'Audit Trail Tamper-Proof', path: '/admin/audit-logs', needsAuthRole: 'admin' },
  { role: 'Admin', menuName: 'Daftar Semua Transaksi', path: '/admin/transaksi', needsAuthRole: 'admin' },
  { role: 'Admin', menuName: 'Chat Sengketa Transaksi', path: '/admin/transaksi/RB-7821/chat', needsAuthRole: 'admin' },
  { role: 'Admin', menuName: 'Manajemen Pengguna', path: '/admin/users', needsAuthRole: 'admin' },
  { role: 'Admin', menuName: 'Profil Super Admin', path: '/admin/profile', needsAuthRole: 'admin' }
];

async function getPageHeading(page: any): Promise<string> {
  try {
    const headingLoc = page.locator('h1, h2, h3, header span.font-extrabold').first();
    if (await headingLoc.count() > 0) {
      const text = await headingLoc.textContent({ timeout: 2000 });
      return text?.trim() || 'Halaman Aktif';
    }
  } catch {
    // fallback
  }
  return 'Halaman Aktif';
}

async function auditAllSubmenusAndFlows() {
  console.log(`========================================================================`);
  console.log(` AUDIT SELURUH SUB-MENU & ALUR NAVIGASI LENGKAP: ${BASE_URL} `);
  console.log(`========================================================================\n`);

  const browser = await chromium.launch({
    executablePath: '/usr/local/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36 Rerasa-Deep-Auditor'
  });

  const page = await context.newPage();
  const pageErrors: { route: string; error: string }[] = [];

  page.on('pageerror', (err) => {
    pageErrors.push({ route: page.url(), error: err.message });
  });

  const auditResults: MenuAudit[] = [];

  // Helper login
  async function performLogin(role: 'seller' | 'admin') {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    if (role === 'seller') {
      const sellerBtn = page.locator('button:has-text("Ruby Bakery")').first();
      await sellerBtn.click();
    } else {
      const adminBtn = page.locator('button:has-text("Admin Rerasa")').first();
      await adminBtn.click();
    }
    await page.waitForTimeout(400);
    const submitBtn = page.locator('button:has-text("Masuk ke Akun")').first();
    await submitBtn.click();
    await page.waitForTimeout(1500);
  }

  // 1. BUYER & PUBLIC ROUTES
  console.log(`--- [1. AUDIT ROUTE BUYER & PUBLIK (${ALL_ROUTES_TO_AUDIT.filter(r => !r.needsAuthRole).length} Halaman)] ---`);
  for (const item of ALL_ROUTES_TO_AUDIT.filter(r => !r.needsAuthRole)) {
    try {
      const targetUrl = `${BASE_URL}${item.path}`;
      const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response ? response.status() : 0;
      await page.waitForTimeout(500);

      const heading = await getPageHeading(page);
      const isNotFound = (await page.locator('h1:has-text("404"), h2:has-text("404")').count()) > 0;
      const isCrash = (await page.locator('h1:has-text("Application error"), h1:has-text("Internal Server Error")').count()) > 0;

      let renderStatus: 'OK' | 'BROKEN' = 'OK';
      let details = 'Tampil normal & interaktif';

      if (status >= 400 || isNotFound) {
        renderStatus = 'BROKEN';
        details = `HTTP ${status} atau 404 Not Found`;
      } else if (isCrash) {
        renderStatus = 'BROKEN';
        details = 'Runtime exception detected on page';
      }

      auditResults.push({
        role: item.role,
        menuName: item.menuName,
        route: item.path,
        httpStatus: status,
        renderStatus,
        pageHeading: heading,
        details
      });

      console.log(`[${renderStatus}] ${item.role} - ${item.menuName} (${item.path}): "${heading}" [HTTP ${status}]`);
    } catch (e: any) {
      auditResults.push({
        role: item.role,
        menuName: item.menuName,
        route: item.path,
        httpStatus: 0,
        renderStatus: 'BROKEN',
        pageHeading: 'Error Exception',
        details: e.message
      });
      console.log(`[BROKEN] ${item.role} - ${item.menuName} (${item.path}): ${e.message}`);
    }
  }

  // 2. SELLER ROUTES
  console.log(`\n--- [2. AUDIT ROUTE SELLER (${ALL_ROUTES_TO_AUDIT.filter(r => r.needsAuthRole === 'seller').length} Sub-Menu)] ---`);
  await performLogin('seller');

  for (const item of ALL_ROUTES_TO_AUDIT.filter(r => r.needsAuthRole === 'seller')) {
    try {
      const targetUrl = `${BASE_URL}${item.path}`;
      const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response ? response.status() : 0;
      await page.waitForTimeout(500);

      const heading = await getPageHeading(page);
      const isNotFound = (await page.locator('h1:has-text("404"), h2:has-text("404")').count()) > 0;
      const isCrash = (await page.locator('h1:has-text("Application error"), h1:has-text("Internal Server Error")').count()) > 0;

      let renderStatus: 'OK' | 'BROKEN' = 'OK';
      let details = 'Tampil normal & terhubung state toko';

      if (status >= 400 || isNotFound) {
        renderStatus = 'BROKEN';
        details = `HTTP ${status} atau 404 Not Found`;
      } else if (isCrash) {
        renderStatus = 'BROKEN';
        details = 'Runtime exception detected on page';
      }

      auditResults.push({
        role: item.role,
        menuName: item.menuName,
        route: item.path,
        httpStatus: status,
        renderStatus,
        pageHeading: heading,
        details
      });

      console.log(`[${renderStatus}] ${item.role} - ${item.menuName} (${item.path}): "${heading}" [HTTP ${status}]`);
    } catch (e: any) {
      auditResults.push({
        role: item.role,
        menuName: item.menuName,
        route: item.path,
        httpStatus: 0,
        renderStatus: 'BROKEN',
        pageHeading: 'Error Exception',
        details: e.message
      });
      console.log(`[BROKEN] ${item.role} - ${item.menuName} (${item.path}): ${e.message}`);
    }
  }

  // 3. ADMIN ROUTES
  console.log(`\n--- [3. AUDIT ROUTE SUPER ADMIN (${ALL_ROUTES_TO_AUDIT.filter(r => r.needsAuthRole === 'admin').length} Sub-Menu)] ---`);
  await performLogin('admin');

  for (const item of ALL_ROUTES_TO_AUDIT.filter(r => r.needsAuthRole === 'admin')) {
    try {
      const targetUrl = `${BASE_URL}${item.path}`;
      const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response ? response.status() : 0;
      await page.waitForTimeout(500);

      const heading = await getPageHeading(page);
      const isNotFound = (await page.locator('h1:has-text("404"), h2:has-text("404")').count()) > 0;
      const isCrash = (await page.locator('h1:has-text("Application error"), h1:has-text("Internal Server Error")').count()) > 0;

      let renderStatus: 'OK' | 'BROKEN' = 'OK';
      let details = 'Tampil normal & terhubung audit/vault';

      if (status >= 400 || isNotFound) {
        renderStatus = 'BROKEN';
        details = `HTTP ${status} atau 404 Not Found`;
      } else if (isCrash) {
        renderStatus = 'BROKEN';
        details = 'Runtime exception detected on page';
      }

      auditResults.push({
        role: item.role,
        menuName: item.menuName,
        route: item.path,
        httpStatus: status,
        renderStatus,
        pageHeading: heading,
        details
      });

      console.log(`[${renderStatus}] ${item.role} - ${item.menuName} (${item.path}): "${heading}" [HTTP ${status}]`);
    } catch (e: any) {
      auditResults.push({
        role: item.role,
        menuName: item.menuName,
        route: item.path,
        httpStatus: 0,
        renderStatus: 'BROKEN',
        pageHeading: 'Error Exception',
        details: e.message
      });
      console.log(`[BROKEN] ${item.role} - ${item.menuName} (${item.path}): ${e.message}`);
    }
  }

  await browser.close();

  // Summary and Markdown Report Generation
  console.log(`\n========================================================================`);
  console.log(` RINGKASAN AUDIT SELURUH SUB-MENU DAN ALUR                              `);
  console.log(`========================================================================`);
  const okCount = auditResults.filter(r => r.renderStatus === 'OK').length;
  const brokenCount = auditResults.filter(r => r.renderStatus === 'BROKEN').length;
  console.log(`Total Sub-Menu / Halaman Diuji: ${auditResults.length}`);
  console.log(`Status OK: ${okCount}`);
  console.log(`Status BROKEN / Error: ${brokenCount}`);
  console.log(`Browser Page Errors: ${pageErrors.length}`);
  console.log(`========================================================================\n`);

  let report = `# LAPORAN AUDIT LENGKAP SELURUH SUB-MENU & ALUR SISTEM\n\n`;
  report += `> Tanggal Audit: ${new Date().toISOString()}  \n`;
  report += `> Target Live URL: [${BASE_URL}](${BASE_URL})  \n`;
  report += `> Total Sub-Menu / Rute Diperiksa: **${auditResults.length} Halaman** | **✓ OK: ${okCount}** | **✗ BROKEN: ${brokenCount}**\n\n`;
  report += `---\n\n`;

  report += `## Matriks Hasil Audit Sub-Menu & Rute\n\n`;
  report += `| Role | Nama Sub-Menu / Fitur | Rute URL | HTTP Status | Status Render | Judul / Heading Terdeteksi |\n`;
  report += `| :--- | :--- | :--- | :---: | :---: | :--- |\n`;
  for (const item of auditResults) {
    const badge = item.renderStatus === 'OK' ? '✓ OK' : '✗ BROKEN';
    report += `| **${item.role}** | ${item.menuName} | \`${item.route}\` | ${item.httpStatus} | **${badge}** | ${item.pageHeading} |\n`;
  }

  if (pageErrors.length > 0) {
    report += `\n## Error Konsol Halaman Terdeteksi\n\n`;
    pageErrors.forEach(err => {
      report += `- Halaman: \`${err.route}\` -> \`${err.error}\`\n`;
    });
  }

  const reportPath = '/root/food-rescue/docs/ALL_SUBMENUS_AUDIT_REPORT.md';
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`Laporan lengkap telah disimpan di: ${reportPath}`);

  return { auditResults, pageErrors };
}

auditAllSubmenusAndFlows();
