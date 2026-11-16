// Todo lo que la web sabe de los instaladores. `descarga.generado.json` lo escribe
// `npm run recursos` a partir de prensa-app (Windows se compila en local; macOS y
// Linux salen del CI). Para publicar otra versión basta con volver a ejecutarlo.

import datos from "./descarga.generado.json";

interface Paquete {
  archivo: string;
  bytes: number;
  sha256: string;
  /** Si este sistema va por detrás de la versión general (p. ej., sin CI para compilarlo). */
  version?: string;
}
interface Generado {
  version: string;
  fecha: string;
  windows: Paquete;
  macos?: Paquete;
  linux?: Paquete;
  deb?: Paquete;
  android?: Paquete;
}
const generado = datos as Generado;

// `VITE_DESCARGAS` (p. ej., la URL de una release de GitHub) cambia de dónde se
// bajan los instaladores. Sin ella, de `public/descargas`. Este módulo lo leen
// tanto el navegador (import.meta.env) como vite.config (process.env).
const entorno = (globalThis as { process?: { env: Record<string, string | undefined> } }).process
  ?.env;
const BASE: string =
  (import.meta.env?.VITE_DESCARGAS as string | undefined) ?? entorno?.VITE_DESCARGAS ?? "";

/** URL de descarga de un instalador a partir de su ruta en public/. */
export function urlDe(archivo: string): string {
  if (!BASE) return `./${archivo}`;
  return BASE.replace(/\/?$/, "/") + archivo.split("/").pop();
}

/** `ios`: iPhone o iPad, donde Prensa no puede existir (ver descarga.ios). */
export type Sistema = "windows" | "macos" | "linux" | "android" | "ios" | "otro";

export interface Opcion {
  id: "windows" | "macos" | "linux" | "deb" | "android";
  sistema: Sistema;
  nombre: string;
  formato: string;
  arquitectura: string;
  url: string;
  version: string;
  bytes: number;
  mb: string;
  sha256: string;
}

const mb = (bytes: number): string => (bytes / 1048576).toFixed(0);

const opcion = (
  id: Opcion["id"],
  sistema: Sistema,
  nombre: string,
  formato: string,
  arquitectura: string,
  p: Paquete | undefined,
): Opcion[] =>
  p
    ? [
        {
          id,
          sistema,
          nombre,
          formato,
          arquitectura,
          url: urlDe(p.archivo),
          version: p.version ?? generado.version,
          bytes: p.bytes,
          mb: mb(p.bytes),
          sha256: p.sha256,
        },
      ]
    : [];

/** Todas las descargas publicadas, en el orden en que se listan. */
export const OPCIONES: Opcion[] = [
  ...opcion("windows", "windows", "Windows 10/11", ".exe", "x64", generado.windows),
  ...opcion("macos", "macos", "macOS", ".dmg", "Apple Silicon", generado.macos),
  ...opcion("linux", "linux", "Linux", "AppImage", "x64", generado.linux),
  ...opcion("deb", "linux", "Debian / Ubuntu", ".deb", "x64", generado.deb),
  ...opcion("android", "android", "Android 11+", ".apk", "arm64", generado.android),
];

export const DESCARGA = {
  version: generado.version,
  fecha: generado.fecha,
  windows: {
    url: urlDe(generado.windows.archivo),
    bytes: generado.windows.bytes,
    mb: mb(generado.windows.bytes),
    sha256: generado.windows.sha256,
  },
};

/** La descarga principal para un sistema (la primera de la lista que le sirve). */
export function opcionPara(sistema: Sistema): Opcion | undefined {
  return OPCIONES.find((o) => o.sistema === sistema);
}

export function sistemaDelVisitante(ua = navigator.userAgent): Sistema {
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  // Los iPad recientes se presentan como Mac: los delata la pantalla táctil.
  if (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios";
  if (/windows/i.test(ua)) return "windows";
  if (/mac os x|macintosh/i.test(ua)) return "macos";
  if (/linux|x11|cros/i.test(ua)) return "linux";
  return "otro";
}
