import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

function copyRecursive(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

async function main() {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  fs.mkdirSync(outDir, { recursive: true });

  const here = fileURLToPath(new URL('.', import.meta.url));
  const gameSrc = path.join(here, 'game');
  const gameDest = path.join(outDir, 'game');
  if (fs.existsSync(gameSrc)) {
    copyRecursive(gameSrc, gameDest);
  }

  const screenshotsSrc = path.join(here, 'screenshots');
  const screenshotsDest = path.join(outDir, 'screenshots');
  if (fs.existsSync(screenshotsSrc)) {
    copyRecursive(screenshotsSrc, screenshotsDest);
  }

  const dossierData = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000
  });

  const dossierPath = path.join(outDir, 'dossier.json');
  fs.writeFileSync(dossierPath, JSON.stringify(dossierData, null, 2));
  console.log(`Dossier successfully written to ${dossierPath}`);
}

main().catch((err) => {
  console.error('Error building dossier:', err);
  process.exit(1);
});
