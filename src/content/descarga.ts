// Todo lo que la web sabe de los instaladores. `descarga.generado.json` lo escribe
// `npm run recursos` a partir de prensa-app (Windows se compila en local; macOS y
// Linux salen del CI). Para publicar otra versión basta con volver a ejecutarlo.

import datos from "./descarga.generado.json";

interface Paquete {
  archivo: string;
  bytes: number;
  sha256: string;
}
interface Generado {
  version: string;
  fecha: string;
  windows: Paquete;
  macos?: Paquete;
  linux?: Paquete;
  deb?: Paquete;
}
const generado = datos as Generado;

export type Sistema = "windows" | "macos" | "linux" | "movil" | "otro";

export interface Opcion {
  id: "windows" | "macos" | "linux" | "deb";
  sistema: Sistema;
  nombre: string;
  formato: string;
  arquitectura: string;
  url: string;
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
          url: p.archivo,
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
];

export const DESCARGA = {
  version: generado.version,
  fecha: generado.fecha,
  windows: {
    url: generado.windows.archivo,
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
  if (/android|iphone|ipad|ipod/i.test(ua)) return "movil";
  // Los iPad recientes se presentan como Mac: los delata la pantalla táctil.
  if (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "movil";
  if (/windows/i.test(ua)) return "windows";
  if (/mac os x|macintosh/i.test(ua)) return "macos";
  if (/linux|x11|cros/i.test(ua)) return "linux";
  return "otro";
}
