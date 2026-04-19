/**
 * Copies the Next.js standalone build output into desktop/resources/standalone/
 * so electron-builder can bundle it via `extraResources` and the forked server
 * can start from a stable, packaged path.
 *
 * Source layout (after `npm run build:desktop` from repo root):
 *   <repo>/.next/standalone/  — server.js + node_modules + traced .next/
 *   <repo>/.next/static/      — client chunks (NOT included in standalone by default)
 *   <repo>/public/            — public assets (NOT included in standalone by default)
 *
 * Destination:
 *   <repo>/desktop/resources/standalone/                — server.js + node_modules
 *   <repo>/desktop/resources/standalone/.next/static/   — copied from .next/static
 *   <repo>/desktop/resources/standalone/public/         — copied from public/
 */

const fs = require("node:fs");
const path = require("node:path");

const desktopRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(desktopRoot, "..");
const standaloneSrc = path.join(repoRoot, ".next", "standalone");
const staticSrc = path.join(repoRoot, ".next", "static");
const publicSrc = path.join(repoRoot, "public");
const destRoot = path.join(desktopRoot, "resources", "standalone");

function rmrf(target) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    throw new Error(`source does not exist: ${src}`);
  }
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true, dereference: false });
}

function main() {
  if (!fs.existsSync(standaloneSrc)) {
    console.error(
      `[copy-standalone] missing ${standaloneSrc}\n` +
        `Run \`npm run build:desktop\` from the repo root first.`
    );
    process.exit(1);
  }

  console.log("[copy-standalone] cleaning destination:", destRoot);
  rmrf(destRoot);

  console.log("[copy-standalone] copying standalone server bundle");
  copyDir(standaloneSrc, destRoot);

  if (fs.existsSync(staticSrc)) {
    const staticDest = path.join(destRoot, ".next", "static");
    console.log("[copy-standalone] copying .next/static");
    copyDir(staticSrc, staticDest);
  } else {
    console.warn("[copy-standalone] WARN: .next/static missing — client chunks won't load");
  }

  if (fs.existsSync(publicSrc)) {
    const publicDest = path.join(destRoot, "public");
    console.log("[copy-standalone] copying public/");
    copyDir(publicSrc, publicDest);
  }

  console.log("[copy-standalone] done");
}

main();
