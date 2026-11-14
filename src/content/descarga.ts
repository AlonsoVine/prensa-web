// Todo lo que la web sabe del instalador. `descarga.generado.json` lo escribe
// `npm run recursos` a partir de prensa-app; para publicar otra versión basta
// con volver a ejecutarlo.

import generado from "./descarga.generado.json";

export const DESCARGA = {
  version: generado.version,
  fecha: generado.fecha,
  windows: {
    url: generado.windows.archivo,
    bytes: generado.windows.bytes,
    mb: (generado.windows.bytes / 1048576).toFixed(0),
    sha256: generado.windows.sha256,
  },
};

export type Sistema = "windows" | "macos" | "linux" | "movil" | "otro";

export function sistemaDelVisitante(ua = navigator.userAgent): Sistema {
  if (/android|iphone|ipad|ipod/i.test(ua)) return "movil";
  if (/windows/i.test(ua)) return "windows";
  if (/mac os x|macintosh/i.test(ua)) return "macos";
  if (/linux|x11|cros/i.test(ua)) return "linux";
  return "otro";
}

export const NOMBRE_SISTEMA: Record<Sistema, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  movil: "móvil",
  otro: "—",
};
