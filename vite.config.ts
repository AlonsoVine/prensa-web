import { defineConfig, type Plugin } from "vite";
import generado from "./src/content/descarga.generado.json" with { type: "json" };
import { CAPTURAS, fuentes } from "./src/content/capturas.ts";
import { OPCIONES } from "./src/content/descarga.ts";
import { es, type Clave } from "./src/i18n/es.ts";

const PUERTO = 4173;

const VALORES: Record<string, string> = {
  version: generado.version,
  mb: (generado.windows.bytes / 1048576).toFixed(0),
  sha: generado.windows.sha256,
  archivo: generado.windows.archivo,
};

function escapar(texto: string): string {
  return texto
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Galería de capturas: el marcado se genera aquí para que exista sin JavaScript.
function figurasDeCapturas(): string {
  return CAPTURAS.map((c, i) => {
    const n = String(i + 1).padStart(2, "0");
    const { src, srcset } = fuentes(c, "es");
    const titulo = `{{cap.${c.id}.t}}`;
    return `<li class="captura" data-indice="${i}">
              <button type="button" class="captura__marco">
                <span class="oculto" data-i18n="capturas.ampliar">{{capturas.ampliar}}</span>
                <img src="${src}" srcset="${srcset}" sizes="(min-width: 900px) 62vw, 88vw" width="1920" height="1080" loading="${i < 2 ? "eager" : "lazy"}" decoding="async" alt="${titulo}" data-i18n-attr="alt:cap.${c.id}.t" data-captura="${c.id}" />
              </button>
              <div class="captura__pie">
                <span class="dato captura__n">${n}</span>
                <h3 class="captura__t" data-i18n="cap.${c.id}.t">${titulo}</h3>
                <p class="captura__d" data-i18n="cap.${c.id}.d">{{cap.${c.id}.d}}</p>
              </div>
            </li>`;
  }).join("\n            ");
}

// Lista de todas las descargas, con su peso y su huella.
function listaDePaquetes(): string {
  return OPCIONES.map(
    (o) => `<li class="paquete">
                <a href="./${o.url}" download>
                  <span class="paquete__so">${escapar(o.nombre)}</span>
                  <span class="paquete__dato">${escapar(o.arquitectura)} · ${escapar(o.formato)} · ${o.mb} MB</span>
                </a>
                <code class="paquete__sha" title="SHA-256 ${o.sha256}">${o.sha256.slice(0, 12)}…</code>
              </li>`,
  ).join("\n              ");
}

// Rellena el HTML con los textos en español al compilar, para que la página
// llegue completa sin JavaScript y los buscadores la lean entera.
//   {{clave}}  → texto de src/i18n/es.ts
//   {{=valor}} → dato del instalador (version, mb, sha, archivo)
function textos(): Plugin {
  return {
    name: "prensa-textos",
    transformIndexHtml(html) {
      return html
        .replace("<!--capturas-->", figurasDeCapturas())
        .replace("<!--paquetes-->", listaDePaquetes())
        .replace(/\{\{=(\w+)\}\}/g, (_, k: string) => {
          const v = VALORES[k];
          if (v === undefined) throw new Error(`Dato desconocido en index.html: ${k}`);
          return escapar(v);
        })
        .replace(/\{\{([\w.-]+)\}\}/g, (_, clave: string) => {
          const texto = es[clave as Clave];
          if (texto === undefined) throw new Error(`Texto desconocido en index.html: ${clave}`);
          const conValores = texto.replace(/\{(\w+)\}/g, (m, k: string) => VALORES[k] ?? m);
          return clave.endsWith("_html") ? conValores : escapar(conValores);
        });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [textos()],
  server: { port: 5173 },
  preview: { port: PUERTO, strictPort: true },
  build: {
    target: "es2022",
    sourcemap: false,
    assetsInlineLimit: 0,
  },
});
