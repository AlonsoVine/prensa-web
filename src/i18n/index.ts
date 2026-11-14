// Idioma de la página. El HTML llega ya en español (se rellena al compilar);
// aquí se decide el idioma inicial y se cambian los textos en vivo.
//
// Marcado:
//   data-i18n="clave"                 → textContent (o innerHTML si la clave acaba en _html)
//   data-i18n-attr="alt:clave;…"      → atributos

import { en } from "./en";
import { es, type Clave } from "./es";

export type Idioma = "es" | "en";
const DICCIONARIOS: Record<Idioma, Record<Clave, string>> = { es, en };
const GUARDADO = "prensa-web:idioma";

let actual: Idioma = "es";
const oyentes = new Set<(idioma: Idioma) => void>();

export function idiomaInicial(): Idioma {
  const pedido = new URLSearchParams(location.search).get("lang");
  if (pedido === "es" || pedido === "en") return pedido;
  try {
    const guardado = localStorage.getItem(GUARDADO);
    if (guardado === "es" || guardado === "en") return guardado;
  } catch {
    // Almacenamiento bloqueado: se sigue con el del navegador.
  }
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

export function idioma(): Idioma {
  return actual;
}

export function t(clave: Clave, valores?: Record<string, string | number>): string {
  let texto = DICCIONARIOS[actual][clave] ?? es[clave];
  if (valores) {
    for (const [k, v] of Object.entries(valores)) texto = texto.replaceAll(`{${k}}`, String(v));
  }
  return texto;
}

export function alCambiarIdioma(oyente: (idioma: Idioma) => void): void {
  oyentes.add(oyente);
}

export function ponerIdioma(nuevo: Idioma, recordar = true): void {
  const cambia = nuevo !== actual;
  actual = nuevo;
  document.documentElement.lang = nuevo;
  document.title = t("meta.title");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.desc"));

  for (const el of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
    const clave = el.dataset.i18n as Clave;
    if (clave.endsWith("_html")) el.innerHTML = t(clave);
    else el.textContent = t(clave);
  }
  for (const el of document.querySelectorAll<HTMLElement>("[data-i18n-attr]")) {
    for (const par of (el.dataset.i18nAttr ?? "").split(";")) {
      const [atributo, clave] = par.split(":");
      if (atributo && clave) el.setAttribute(atributo, t(clave as Clave));
    }
  }

  if (recordar) {
    try {
      localStorage.setItem(GUARDADO, nuevo);
    } catch {
      // Sin almacenamiento no pasa nada: solo no se recuerda.
    }
  }
  if (cambia) for (const oyente of oyentes) oyente(nuevo);
}
