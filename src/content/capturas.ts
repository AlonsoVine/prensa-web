// Capturas de la galería, en orden. Las imágenes las genera scripts/recursos.mjs.
// `en: true` → existe una variante con la interfaz en inglés.
export const CAPTURAS = [
  { id: "inicio", en: true },
  { id: "lista", en: true },
  { id: "descargando", en: false },
  { id: "completado", en: false },
  { id: "parcial", en: true },
  { id: "bloqueo", en: false },
] as const;

export type Captura = (typeof CAPTURAS)[number];

export function fuentes(c: Captura, idioma: "es" | "en"): { src: string; srcset: string } {
  const base = `capturas/${c.id}${idioma === "en" && c.en ? "--en" : ""}`;
  return { src: `${base}-1920.webp`, srcset: `${base}-960.webp 960w, ${base}-1920.webp 1920w` };
}
