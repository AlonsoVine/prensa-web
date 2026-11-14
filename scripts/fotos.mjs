// Fotos de la web para revisarla: recorre la página pantalla a pantalla en varios
// tamaños y guarda capturas del viewport, más los errores de consola.
// Uso: node scripts/fotos.mjs <url> <carpeta> [anchos=1920,1280,390] [extra=query]
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const [
  url = "http://localhost:5173/",
  carpeta = ".revision/fotos",
  anchosTxt = "1920,1280,390",
  extra = "",
] = process.argv.slice(2);
const anchos = anchosTxt.split(",").map(Number);
const ALTOS = { 1920: 1080, 1440: 900, 1280: 800, 768: 1024, 390: 844 };

await mkdir(carpeta, { recursive: true });
const navegador = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const informe = [];
for (const ancho of anchos) {
  const alto = ALTOS[ancho] ?? 900;
  const pagina = await navegador.newPage({
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 1,
    hasTouch: ancho < 800,
    isMobile: ancho < 800,
  });
  const errores = [];
  pagina.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  pagina.on("pageerror", (e) => errores.push(String(e)));
  const destino = url + (extra ? (url.includes("?") ? "&" : "?") + extra : "");
  await pagina.goto(destino, { waitUntil: "networkidle" });
  await pagina.waitForTimeout(4200); // precarga + entrada
  const total = await pagina.evaluate(() => document.documentElement.scrollHeight);
  const desborde = await pagina.evaluate(
    () => document.documentElement.scrollWidth > innerWidth + 1,
  );
  let y = 0;
  let i = 0;
  while (y < total && i < 40) {
    await pagina.evaluate((v) => window.scrollTo(0, v), y);
    await pagina.waitForTimeout(1100);
    const nombre = `${ancho}${extra ? "-" + extra.replace(/[^a-z0-9]+/gi, "_") : ""}-${String(i).padStart(2, "0")}.png`;
    await pagina.screenshot({ path: path.join(carpeta, nombre) });
    y += Math.round(alto * 0.9);
    i++;
  }
  informe.push({ ancho, alto, total, desborde, capturas: i, errores });
  await pagina.close();
}
await navegador.close();
await writeFile(path.join(carpeta, "informe.json"), JSON.stringify(informe, null, 2));
console.log(JSON.stringify(informe, null, 2));
