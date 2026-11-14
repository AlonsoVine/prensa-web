// Tarjeta para compartir (1200 × 630): un póster propio, no una captura de la web.
// Se pinta desde scripts/og.html con las fuentes de la marca.
// Uso: node scripts/og.mjs
import { chromium } from "@playwright/test";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const navegador = await chromium.launch();
const pagina = await navegador.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
await pagina.goto(pathToFileURL(path.join(raiz, "scripts/og.html")).href);
await pagina.evaluate(() => document.fonts.ready);
const png = await pagina.screenshot();
await sharp(png)
  .resize(1200, 630)
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(path.join(raiz, "public/og.jpg"));
await navegador.close();
console.log("public/og.jpg");
