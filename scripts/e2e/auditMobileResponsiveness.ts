import { chromium } from '/root/rerasa-motion/showcase-ui/node_modules/playwright-core';

interface AuditResult {
  role: string;
  url: string;
  viewport: { width: number; height: number };
  hasHorizontalOverflow: boolean;
  scrollWidth: number;
  clientWidth: number;
  touchTargetsViolations: number;
  criticalIssues: string[];
}

const VIEWPORTS = [
  { name: 'iPhone SE (Narrow)', width: 375, height: 667 },
  { name: 'Android Standard', width: 390, height: 844 },
  { name: 'Large Mobile / Tablet Portrait', width: 428, height: 926 },
];

const SELLER_ROUTES = [
  'https://rerasa.fizaa.me/seller',
  'https://rerasa.fizaa.me/seller/bags',
  'https://rerasa.fizaa.me/seller/bags/new',
  'https://rerasa.fizaa.me/seller/orders',
  'https://rerasa.fizaa.me/seller/boxes',
  'https://rerasa.fizaa.me/seller/finance',
  'https://rerasa.fizaa.me/seller/profile',
];

const ADMIN_ROUTES = [
  'https://rerasa.fizaa.me/admin',
  'https://rerasa.fizaa.me/admin/mitra',
  'https://rerasa.fizaa.me/admin/transaksi',
  'https://rerasa.fizaa.me/admin/keuangan',
  'https://rerasa.fizaa.me/admin/boxes',
  'https://rerasa.fizaa.me/admin/audit',
  'https://rerasa.fizaa.me/admin/audit-logs',
  'https://rerasa.fizaa.me/admin/users',
  'https://rerasa.fizaa.me/admin/profile',
];

async function runMobileAudit() {
  console.log('=== STARTING MOBILE RESPONSIVENESS AUDIT (ANTI-SLOP R-03, R-35) ===');

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/local/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  const results: AuditResult[] = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n--- TESTING VIEWPORT: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
      isMobile: true,
      hasTouch: true,
    });

    const page = await context.newPage();

    // 1. Audit Seller Routes (Simulate Seller User)
    await page.goto('https://rerasa.fizaa.me/seller', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => {
      // Pastikan storeService client tersinkron seller
      try {
        const raw = localStorage.getItem('foodrescue_store_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.currentUser = {
            id: 'user-seller-ruby',
            name: 'Siti Rahmawati',
            email: 'seller@rerasa.com',
            role: 'seller',
            storeId: 'store-ruby-bakery',
          };
          localStorage.setItem('foodrescue_store_v1', JSON.stringify(parsed));
        }
      } catch (e) {}
    });

    for (const url of SELLER_ROUTES) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(600);

        const metrics = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientWidth = docEl.clientWidth;
          const hasHorizontalOverflow = scrollWidth > clientWidth + 2;

          // Periksa tombol atau link interaktif yang ukurannya terlalu kecil (< 32px tanpa hit-area)
          const interactives = Array.from(document.querySelectorAll('button, a, input, select'));
          let tinyTargets = 0;
          for (const el of interactives) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              if (rect.width < 28 || rect.height < 28) {
                tinyTargets++;
              }
            }
          }

          // Periksa elemen yang menyebabkan horizontal scroll
          const leakingElements: string[] = [];
          if (hasHorizontalOverflow) {
            const all = Array.from(document.querySelectorAll('*'));
            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.right > clientWidth + 4) {
                const tag = el.tagName.toLowerCase();
                const cls = el.className ? `.${String(el.className).split(' ').slice(0, 2).join('.')}` : '';
                leakingElements.push(`${tag}${cls} (right: ${Math.round(r.right)}px)`);
                if (leakingElements.length >= 3) break;
              }
            }
          }

          return {
            scrollWidth,
            clientWidth,
            hasHorizontalOverflow,
            tinyTargets,
            leakingElements,
          };
        });

        results.push({
          role: 'Seller',
          url,
          viewport: { width: vp.width, height: vp.height },
          hasHorizontalOverflow: metrics.hasHorizontalOverflow,
          scrollWidth: metrics.scrollWidth,
          clientWidth: metrics.clientWidth,
          touchTargetsViolations: metrics.tinyTargets,
          criticalIssues: metrics.leakingElements,
        });

        const icon = metrics.hasHorizontalOverflow ? '❌ OVERFLOW' : '✓ OK';
        console.log(`[Seller] ${new URL(url).pathname} (${vp.width}px): ${icon} (scrollWidth: ${metrics.scrollWidth}px vs clientWidth: ${metrics.clientWidth}px)`);
        if (metrics.leakingElements.length > 0) {
          console.log(`   Leaks: ${metrics.leakingElements.join(' | ')}`);
        }
      } catch (err: any) {
        console.error(`[Seller] Error loading ${url}:`, err.message);
      }
    }

    // 2. Audit Admin Routes (Simulate Admin User)
    await page.goto('https://rerasa.fizaa.me/admin', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => {
      try {
        const raw = localStorage.getItem('foodrescue_store_v1');
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.currentUser = {
            id: 'user-admin-1',
            name: 'Super Admin',
            email: 'admin@rerasa.com',
            role: 'admin',
          };
          localStorage.setItem('foodrescue_store_v1', JSON.stringify(parsed));
        }
      } catch (e) {}
    });

    for (const url of ADMIN_ROUTES) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(600);

        const metrics = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientWidth = docEl.clientWidth;
          const hasHorizontalOverflow = scrollWidth > clientWidth + 2;

          const leakingElements: string[] = [];
          if (hasHorizontalOverflow) {
            const all = Array.from(document.querySelectorAll('*'));
            for (const el of all) {
              const r = el.getBoundingClientRect();
              if (r.right > clientWidth + 4) {
                const tag = el.tagName.toLowerCase();
                const cls = el.className ? `.${String(el.className).split(' ').slice(0, 2).join('.')}` : '';
                leakingElements.push(`${tag}${cls} (right: ${Math.round(r.right)}px)`);
                if (leakingElements.length >= 3) break;
              }
            }
          }

          return {
            scrollWidth,
            clientWidth,
            hasHorizontalOverflow,
            leakingElements,
          };
        });

        results.push({
          role: 'Admin',
          url,
          viewport: { width: vp.width, height: vp.height },
          hasHorizontalOverflow: metrics.hasHorizontalOverflow,
          scrollWidth: metrics.scrollWidth,
          clientWidth: metrics.clientWidth,
          touchTargetsViolations: 0,
          criticalIssues: metrics.leakingElements,
        });

        const icon = metrics.hasHorizontalOverflow ? '❌ OVERFLOW' : '✓ OK';
        console.log(`[Admin] ${new URL(url).pathname} (${vp.width}px): ${icon} (scrollWidth: ${metrics.scrollWidth}px vs clientWidth: ${metrics.clientWidth}px)`);
        if (metrics.leakingElements.length > 0) {
          console.log(`   Leaks: ${metrics.leakingElements.join(' | ')}`);
        }
      } catch (err: any) {
        console.error(`[Admin] Error loading ${url}:`, err.message);
      }
    }

    await context.close();
  }

  await browser.close();

  const total = results.length;
  const overflows = results.filter((r) => r.hasHorizontalOverflow);
  console.log(`\n=== AUDIT SUMMARY: ${total} checks, ${overflows.length} with horizontal overflow leak ===`);
}

runMobileAudit().catch(console.error);
