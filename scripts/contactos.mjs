// Hoja de contactos: junta las capturas de una carpeta en una cuadrícula.
// Uso: node scripts/contactos.mjs <carpeta> <prefijo> <salida> [columnas=4] [ancho=600]
import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [carpeta, prefijo, salida, colsTxt = "4", anchoTxt = "600"] = process.argv.slice(2);
const cols = Number(colsTxt);
const ancho = Number(anchoTxt);
const archivos = (await readdir(carpeta))
  .filter((f) => f.startsWith(prefijo) && f.endsWith(".png"))
  .sort();
const muestras = await Promise.all(
  archivos.map((f) =>
    sharp(path.join(carpeta, f)).resize({ width: ancho }).toBuffer({ resolveWithObject: true }),
  ),
);
const alto = Math.max(...muestras.map((m) => m.info.height));
const filas = Math.ceil(muestras.length / cols);
await sharp({
  create: {
    width: cols * ancho + (cols - 1) * 8,
    height: filas * alto + (filas - 1) * 8,
    channels: 3,
    background: "#ff00ff",
  },
})
  .composite(
    muestras.map((m, i) => ({
      input: m.data,
      left: (i % cols) * (ancho + 8),
      top: Math.floor(i / cols) * (alto + 8),
    })),
  )
  .png()
  .toFile(salida);
console.log(salida, archivos.length);
