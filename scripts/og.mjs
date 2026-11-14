// Imagen para redes (1200 × 630) a partir del hero real.
// Uso: node scripts/og.mjs [url]
import { chromium } from "@playwright/test";
import sharp from "sharp";

const url = process.argv[2] ?? "http://localhost:5173/?lang=es";
const navegador = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const pagina = await navegador.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
await pagina.goto(url, { waitUntil: "networkidle" });
await pagina.waitForTimeout(4500);
const png = await pagina.screenshot();
await sharp(png).resize(1200, 630).jpeg({ quality: 84, mozjpeg: true }).toFile("public/og.jpg");
await navegador.close();
console.log("public/og.jpg");
