import fs from 'node:fs/promises';
import path from 'node:path';

const SCREENS = [
  {
    id: 'b46cebb3bc8648ea96c1f5ba34a975ec',
    folderName: '1_chat_and_check_in',
    title: 'Nudge - Chat & Check-in (Airy Sky)',
    screenshotUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1Xh6Ay1-UcNUYWgbynhqk5S3cVfJmOmu5F32p7flHhRPrirqeMTTCOD7nyN0bY4NyP6lbHrU2N-ZUkd3x7bDGOKpF30A91T6CLxJPxQPMsjpFB2QOd9IuiZ_L_bkSUGCFsAI0P1jyGpB-p6F-jz_mjtZ3y9LhJR9IVqaxQJxHJTHI5seSAkIgeBA4yf5YBFTFvt8gwb7b_eiyHuyWFXxpNIZSRPu0cOhMn21CGokjdtVTjhbrEID_rMg68',
    htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1Yzg5MDJmNmY4YmYwNzNhY2MxMzdkMGM4YTZmEgsSBxDVl5X8qR0YAZIBJAoKcHJvamVjdF9pZBIWQhQxMDYxNjQ0NTg1MTMwNTM5NTA2MA&filename=&opi=89354086'
  },
  {
    id: '88de67eb4a9940229b5145ec6490d554',
    folderName: '2_timetable_and_schedule',
    title: 'Nudge - Timetable & Schedule (Airy Sky)',
    screenshotUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1WVLcc4CRofAJ7CGJ50RrrYZqQpfDKm-Wh-DgrT_g7fvAYAaiE1ZrBFrUbc_XLSGuNhu2-00uZGfE1oFtTBoE1kZsWdMVsuVdpJKBOJ8E2SyHmvhyQilIrjAeTwE8NSoqZV46SwJ0WcOMwHgdpklmGEVJZM_AnrFASt6PT4ls8-d9o-1Y2yC_-Qp2UDnqDTWTn1kgDuAcLGCxNuXplmi2Mwo7vDcouQMFmcXLwiAykZlkANhCrAcXeOudg',
    htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YzQ5MmIyMDJmYjQwNTIyODRkNDZhMGIzZDEzEgsSBxDVl5X8qR0YAZIBJAoKcHJvamVjdF9pZBIWQhQxMDYxNjQ0NTg1MTMwNTM5NTA2MA&filename=&opi=89354086'
  },
  {
    id: '241ecf5ce1e144b7a9cc70bee89a556c',
    folderName: '3_add_assignment',
    title: 'Nudge - Add Assignment (Airy Sky)',
    screenshotUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UdPcQjHvBnsrQnjImWL0wKWUWKXuS5ZopAzzCQ9GZ0YobaGMpQ8m53pN5ZNQqIoLT9ClBX1lckq6xSinQSZNPSh3CBXqlzYhjATSrL2VEJ2HzAtgHLYQ8eft9yJy_sm-1coDl_tLPbyy0sjPbylN3dK5QMEcp8zQWMkheNcalexlTW0Tanh4PCn1BuKOWZywt0fSTX0x02QYM-vx_tBOghxBTVLsrJB1oit__P-zy5ILWn3Q5mjJolDy_P',
    htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1Yzg5MDJkMzBiNWUwNzc5OWZkZTY3MTM0N2E0EgsSBxDVl5X8qR0YAZIBJAoKcHJvamVjdF9pZBIWQhQxMDYxNjQ0NTg1MTMwNTM5NTA2MA&filename=&opi=89354086'
  },
  {
    id: 'c0cbcd733c734a3abbb7a7dc54977f5a',
    folderName: '4_milestones_and_badges',
    title: 'Nudge - Milestones & Badges (Airy Sky)',
    screenshotUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1XBbpD9lEej5zm8lSvkQOr0z5BKzniNkFDN4SHpT3TwFLkdLKJivGx5m50kyFOTP-F0p0Qlrr6I8MO66LilILrXtqGPFH6U7bn-f5779uu7QoOcmZgDcUcBz_mXCzb7XJ1-Tqwmr4L_jAgqO1B-UMMlRSBZN3sI1c3gwftpYOSl-HAwVvN4KiHUxwdnNayYvwVrdersNMyD0bO0Q2q49BZznxYcWL7D4ilhMaMKkT1Ycv4yxwgeK0F2WB4Y',
    htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1Yzg5MDI1NGFlODkwMjJkN2ViYWQ5MTY1ZjA3EgsSBxDVl5X8qR0YAZIBJAoKcHJvamVjdF9pZBIWQhQxMDYxNjQ0NTg1MTMwNTM5NTA2MA&filename=&opi=89354086'
  },
  {
    id: '6f0702acc1f14692abd8751a8ff9390e',
    folderName: '5_settings',
    title: 'Nudge - Settings (Airy Sky)',
    screenshotUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1X7RtEl5fiSgwMWUgInt1HvzdOGqCPQTYTPcEzyszIKTiLzjCG7m24r2YjMLdk6kS2ov8VaN_yP4zMa1E-pgJVm7YHiYyJJbsGnkyz7XW568XG7Po1P5sO0EjGOBV0Dc6-MiVtWpo97Z4sY1XxwaSd-EsJuqSnLLfvV4a-sYdgRHa3v2jIi3CsCJQ90qZZpi3nXlVWnPrRi94_ldhWzjFHodtIF0aMNMTp7mTz8JlORW-tgwyidRkqRz5Y',
    htmlUrl: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1Yzg5MDJlNGZjMTAwMmE5YjRkZTk1MjIwNDgxEgsSBxDVl5X8qR0YAZIBJAoKcHJvamVjdF9pZBIWQhQxMDYxNjQ0NTg1MTMwNTM5NTA2MA&filename=&opi=89354086'
  }
];

const BASE_DIR = path.resolve('stitch-export', 'airy_sky_screens');

async function downloadFile(url, destPath) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();
  await fs.writeFile(destPath, Buffer.from(buffer));
}

async function run() {
  console.log(`[Stitch Downloader] Starting download for 5 Airy Sky screens to ${BASE_DIR}...`);
  await fs.mkdir(BASE_DIR, { recursive: true });

  const manifest = [];

  for (const s of SCREENS) {
    console.log(`\nProcessing: ${s.title} (${s.id})`);
    const screenDir = path.join(BASE_DIR, s.folderName);
    await fs.mkdir(screenDir, { recursive: true });

    const htmlPath = path.join(screenDir, 'code.html');
    const imagePath = path.join(screenDir, 'screen.png');

    let htmlSuccess = false;
    let imageSuccess = false;

    try {
      console.log(`  -> Downloading code.html...`);
      await downloadFile(s.htmlUrl, htmlPath);
      const stat = await fs.stat(htmlPath);
      console.log(`     ✓ Saved code.html (${stat.size} bytes)`);
      htmlSuccess = true;
    } catch (err) {
      console.error(`     ✗ Failed code.html: ${err.message}`);
    }

    try {
      console.log(`  -> Downloading screenshot image...`);
      await downloadFile(s.screenshotUrl, imagePath);
      const stat = await fs.stat(imagePath);
      console.log(`     ✓ Saved screen.png (${stat.size} bytes)`);
      imageSuccess = true;
    } catch (err) {
      console.error(`     ✗ Failed screen.png: ${err.message}`);
    }

    manifest.push({
      id: s.id,
      title: s.title,
      folder: s.folderName,
      htmlPath: path.relative(process.cwd(), htmlPath),
      htmlSuccess,
      imagePath: path.relative(process.cwd(), imagePath),
      imageSuccess
    });
  }

  await fs.writeFile(
    path.join(BASE_DIR, 'manifest.json'),
    JSON.stringify({ projectId: '10616445851305395060', downloadedAt: new Date().toISOString(), screens: manifest }, null, 2),
    'utf8'
  );

  console.log(`\n[Stitch Downloader] Done! All 5 screens saved.`);
}

run().catch((err) => {
  console.error('[Error]:', err);
  process.exit(1);
});
