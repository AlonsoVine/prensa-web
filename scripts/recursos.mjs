// Prepara los recursos de la web a partir de prensa-app:
//  - capturas reales (PNG) → WebP en dos anchos
//  - instaladores (Windows local; macOS y Linux del CI) → public/descargas, con SHA-256 y peso
//  - iconos de la app → favicon
// Se ejecuta a mano (`npm run recursos`) cuando cambia la app; el resultado se versiona.

import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const app = path.resolve(raiz, process.env.PRENSA_APP ?? "../prensa-app");
const capturas = path.join(app, "tests/e2e/capturas");

// Nombre en la web → captura de origen. Las que tienen variante inglesa la llevan en `en`.
const SELECCION = [
  { id: "inicio", es: "grande/inicio.png", en: "grande/inicio--en.png" },
  { id: "estanteria", es: "grande/estanteria.png" },
  { id: "lista", es: "grande/lista-cargada.png", en: "grande/lista-cargada--en.png" },
  { id: "lista-crecida", es: "grande/lista-crecida.png" },
  { id: "lista-claro", es: "grande/lista-cargada--claro.png" },
  { id: "descargando", es: "grande/descargando.png" },
  { id: "descargando-claro", es: "grande/descargando--claro.png" },
  { id: "completado", es: "grande/completado.png" },
  { id: "parcial", es: "grande/parcial.png", en: "grande/parcial--en.png" },
  { id: "bloqueo", es: "grande/bloqueo-de-youtube.png" },
  { id: "ajustes", es: "grande/ajustes.png" },
];
const ANCHOS = [1920, 960];

async function capturasWeb() {
  const destino = path.join(raiz, "public/capturas");
  await mkdir(destino, { recursive: true });
  for (const c of SELECCION) {
    for (const idioma of ["es", "en"]) {
      const origen = c[idioma];
      if (!origen) continue;
      for (const ancho of ANCHOS) {
        const nombre = `${c.id}${idioma === "en" ? "--en" : ""}-${ancho}.webp`;
        await sharp(path.join(capturas, origen))
          .resize({ width: ancho })
          .webp({ quality: ancho > 1000 ? 80 : 78, effort: 6 })
          .toFile(path.join(destino, nombre));
      }
    }
  }
  console.log(`capturas: ${SELECCION.length}`);
}

async function instalador() {
  const conf = JSON.parse(await readFile(path.join(app, "src-tauri/tauri.conf.json"), "utf8"));
  const version = conf.version;
  const nombre = `Prensa_${version}_x64-setup.exe`;
  const origen = path.join(app, "src-tauri/target/release/bundle/nsis", nombre);
  const destino = path.join(raiz, "public/descargas", nombre);
  await mkdir(path.dirname(destino), { recursive: true });
  await copyFile(origen, destino);
  const datos = await readFile(destino);
  const sha256 = createHash("sha256").update(datos).digest("hex");
  const { size, mtime } = await stat(origen);
  const info = {
    version,
    windows: { archivo: `descargas/${nombre}`, bytes: size, sha256 },
    ...(await otrosSistemas(version)),
    fecha: mtime.toISOString().slice(0, 10),
  };
  await writeFile(
    path.join(raiz, "src/content/descarga.generado.json"),
    JSON.stringify(info, null, 2) + "\n",
  );
  console.log(`instalador: ${nombre} ${(size / 1048576).toFixed(1)} MB ${sha256}`);
}

// macOS y Linux no se compilan aquí: salen del CI de prensa-app (artefactos
// `prensa-macos-latest` y `prensa-ubuntu-latest`), descargados con
//   gh run download <id> -R AlonsoVine/prensa -D ../prensa-app/.artefactos-ci
const ARTEFACTOS = path.join(app, ".artefactos-ci");

async function buscar(carpeta, fin) {
  const { readdir } = await import("node:fs/promises");
  let entradas;
  try {
    entradas = await readdir(carpeta, { withFileTypes: true, recursive: true });
  } catch {
    return null;
  }
  const hallada = entradas.find((e) => e.isFile() && e.name.endsWith(fin));
  return hallada ? path.join(hallada.parentPath ?? hallada.path, hallada.name) : null;
}

async function publicar(origen, nombre = path.basename(origen)) {
  const destino = path.join(raiz, "public/descargas", nombre);
  await copyFile(origen, destino);
  const datos = await readFile(destino);
  const sha256 = createHash("sha256").update(datos).digest("hex");
  console.log(`instalador: ${nombre} ${(datos.length / 1048576).toFixed(1)} MB ${sha256}`);
  return { archivo: `descargas/${nombre}`, bytes: datos.length, sha256 };
}

async function otrosSistemas(version) {
  const dmg = await buscar(path.join(ARTEFACTOS, "prensa-macos-latest"), `${version}_aarch64.dmg`);
  const appimage = await buscar(path.join(ARTEFACTOS, "prensa-ubuntu-latest"), ".AppImage");
  const deb = await buscar(path.join(ARTEFACTOS, "prensa-ubuntu-latest"), ".deb");
  const otros = {};
  if (dmg) otros.macos = await publicar(dmg);
  if (appimage) otros.linux = await publicar(appimage);
  if (deb) otros.deb = await publicar(deb);
  // Android: artefacto `prensa-android` del workflow Android de prensa-app.
  const apk = await buscar(path.join(ARTEFACTOS, "prensa-android"), ".apk");
  if (apk) otros.android = await publicar(apk, `Prensa_${version}_arm64.apk`);
  return otros;
}

async function iconos() {
  const iconos = path.join(app, "src-tauri/icons");
  await copyFile(path.join(iconos, "icon.ico"), path.join(raiz, "public/favicon.ico"));
  await sharp(path.join(iconos, "icon.png"))
    .resize(180)
    .png()
    .toFile(path.join(raiz, "public/apple-touch-icon.png"));
  await sharp(path.join(iconos, "icon.png"))
    .resize(64)
    .png()
    .toFile(path.join(raiz, "public/icono-64.png"));
}

await capturasWeb();
await instalador();
await iconos();
