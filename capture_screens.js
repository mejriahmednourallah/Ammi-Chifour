const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('./frontend/node_modules/puppeteer-core');

const DIST_DIR = path.join(__dirname, 'frontend', 'dist', 'ami-chifour', 'browser');
const OUT_DIR = path.join(__dirname, 'docs', 'screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// MIME types
const MIME = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Simple SPA static server
const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // SPA fallback
    const indexHtml = path.join(DIST_DIR, 'index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(indexHtml).pipe(res);
  }
});

server.listen(5173, async () => {
  console.log('Static SPA server running on http://localhost:5173');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 412,
    height: 892,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  async function snap(route, filename, waitExtra = 1000, actionBeforeSnap = null) {
    console.log(`Capturing: ${route} -> ${filename}`);
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, waitExtra));
    if (actionBeforeSnap) {
      await actionBeforeSnap(page);
      await new Promise(r => setTimeout(r, 800));
    }
    const dest = path.join(OUT_DIR, filename);
    await page.screenshot({ path: dest, fullPage: false });
    console.log(`Saved: ${dest}`);
  }

  try {
    // 1. Search Screen (Destinations & Tariffs)
    await snap('/tabs/search', '01_search_destinations.png', 1200);

    // 2. Live Station Board Screen (Hero vehicle, seat dots, freshness, queue)
    await snap('/tabs/board', '02_live_station_board.png', 1500);

    // 3. Favorites Screen
    await snap('/tabs/favorites', '03_saved_favorites.png', 1200);

    // 4. Staff Screen (Oversized +/- buttons, depart, queue reorder)
    await snap('/tabs/staff', '04_staff_operations.png', 1200);

    // 5. Staff Screen with Join Queue Modal opened
    await snap('/tabs/staff', '05_staff_join_modal.png', 1200, async (p) => {
      const fabBtn = await p.$('ion-fab-button');
      if (fabBtn) await fabBtn.click();
    });

    // 6. Arabic / RTL view (Switch to Arabic)
    await snap('/tabs/board', '06_arabic_rtl_view.png', 1200, async (p) => {
      // Click on Arabic segment button
      const buttons = await p.$$('.lang-segment ion-segment-button');
      if (buttons && buttons.length >= 2) {
        await buttons[1].click();
      }
    });

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
    server.close();
    process.exit(0);
  }
});
