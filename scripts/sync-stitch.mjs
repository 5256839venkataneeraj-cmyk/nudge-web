import { stitch } from '@google/stitch-sdk';
import fs from 'node:fs/promises';
import path from 'node:path';

const API_KEY = process.env.STITCH_API_KEY || '';
process.env.STITCH_API_KEY = API_KEY;

const PROJECT_ID = '10616445851305395060';
const OUTPUT_DIR = path.resolve('stitch-export');

async function sync() {
  console.log(`[Stitch Sync] Starting sync for project ${PROJECT_ID}...`);
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(path.join(OUTPUT_DIR, 'screens'), { recursive: true });

  const project = stitch.project(PROJECT_ID);
  
  // 1. Download full assets if supported
  try {
    console.log(`[Stitch Sync] Downloading assets to ${OUTPUT_DIR}...`);
    const assetResult = await project.downloadAssets(path.join(OUTPUT_DIR, 'downloaded'));
    console.log(`[Stitch Sync] Downloaded ${assetResult.screens?.length || 0} screens via downloadAssets`);
  } catch (err) {
    console.warn(`[Stitch Sync] downloadAssets note: ${err.message}. Falling back to screen iteration...`);
  }

  // 2. Fetch screens individually
  const screens = await project.screens();
  console.log(`[Stitch Sync] Found ${screens.length} screens.`);

  const summary = [];

  for (const s of screens) {
    const screenId = s.screenId;
    const title = s.title || screenId;
    console.log(`[Stitch Sync] Fetching screen: ${title} (${screenId})...`);

    let html = null;
    try {
      html = await s.getHtml();
    } catch (e) {
      // not all screens have html
    }

    let screenshotUrl = null;
    try {
      screenshotUrl = s.screenshotUrl || null;
    } catch (e) {}

    if (html) {
      const fileName = `${screenId}.html`;
      await fs.writeFile(path.join(OUTPUT_DIR, 'screens', fileName), html, 'utf8');
      console.log(`  -> Saved ${fileName} (${html.length} bytes)`);
    }

    summary.push({
      screenId,
      title,
      hasHtml: Boolean(html),
      htmlLength: html ? html.length : 0,
      screenshotUrl
    });
  }

  // 3. Save summary manifest
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'screens-manifest.json'),
    JSON.stringify({ projectId: PROJECT_ID, syncedAt: new Date().toISOString(), totalScreens: screens.length, screens: summary }, null, 2),
    'utf8'
  );

  console.log(`[Stitch Sync] Sync complete! Saved to ${OUTPUT_DIR}`);
}

sync().catch(err => {
  console.error('[Stitch Sync Error]:', err);
  process.exit(1);
});
