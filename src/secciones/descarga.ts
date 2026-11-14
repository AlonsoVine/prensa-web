// Descarga: ofrece el instalador del sistema del visitante, copia la huella
// SHA-256 y estampa el sello. En el móvil no se descarga nada: se ofrece
// enviarse el enlace para abrirlo en el ordenador.
import gsap from "gsap";
import { opcionPara, sistemaDelVisitante, type Opcion } from "../content/descarga";
import { t } from "../i18n";
import type { Clave } from "../i18n/es";

const NOMBRE: Record<string, string> = { windows: "Windows", macos: "macOS", linux: "Linux" };

/** Cambia la clave de un texto traducible y lo reescribe. */
function rotular(el: Element | null, clave: Clave): void {
  if (!(el instanceof HTMLElement)) return;
  el.dataset.i18n = clave;
  el.textContent = t(clave);
}

export function montarDescarga(quieto: boolean): void {
  const sistema = sistemaDelVisitante();
  const tarjeta = document.querySelector<HTMLElement>(".descarga__tarjeta");
  const principal = tarjeta?.querySelector<HTMLAnchorElement>("a[data-descarga]");
  const tuyo = document.querySelector<HTMLElement>(".descarga__tuyo");
  const detalle = document.querySelector<HTMLElement>(".descarga__detalle");
  const valor = document.querySelector<HTMLElement>(".sha__valor");
  const estadoCopia = document.querySelector<HTMLElement>(".sha__estado");
  const enlaces = [...document.querySelectorAll<HTMLAnchorElement>("a[data-descarga]")];

  // ── El instalador que toca ──
  const op: Opcion | undefined = opcionPara(sistema);
  const escribirSistema = (): void => {
    if (!tuyo) return;
    if (sistema === "movil") {
      tuyo.hidden = false;
      tuyo.textContent = t("descarga.movil");
    } else if (NOMBRE[sistema]) {
      tuyo.hidden = false;
      tuyo.textContent = t("descarga.tuyo", { so: NOMBRE[sistema] });
    }
  };
  const escribirDetalle = (): void => {
    if (!detalle || !op || op.id === "windows") return;
    delete detalle.dataset.i18n;
    detalle.textContent = t(`descarga.detalle.${op.id}` as Clave, { mb: op.mb });
  };

  if (op && op.id !== "windows") {
    for (const a of enlaces) {
      a.href = `./${op.url}`;
      const texto = a.querySelector("[data-i18n]");
      if (texto?.getAttribute("data-i18n") !== "final.boton")
        rotular(texto, `descarga.boton.${op.id}` as Clave);
    }
    if (valor) valor.textContent = op.sha256;
    for (const dato of document.querySelectorAll(".dato-paquete"))
      dato.textContent = `${op.mb} MB · ${op.nombre}`;
    rotular(document.querySelector(".descarga__aviso"), `descarga.aviso.${op.id}` as Clave);
    rotular(document.querySelector(".descarga__req"), `descarga.requisitos.${op.id}` as Clave);
    escribirDetalle();
  }

  if (sistema === "movil") {
    // Un instalador de escritorio no sirve en el móvil: las llamadas llevan a la
    // tarjeta, y la tarjeta ofrece enviarse el enlace.
    for (const a of enlaces) {
      a.removeAttribute("download");
      if (a !== principal) {
        a.href = "#descarga";
        rotular(a.querySelector("[data-i18n]"), "descarga.movil.cta");
      }
    }
    if (principal) {
      rotular(principal.querySelector("[data-i18n]"), "descarga.compartir");
      principal.addEventListener("click", async (e) => {
        e.preventDefault();
        const url = location.href.split("#")[0] ?? location.href;
        try {
          if (navigator.share) await navigator.share({ title: "Prensa", url });
          else {
            await navigator.clipboard.writeText(url);
            if (estadoCopia) estadoCopia.textContent = t("descarga.enlace.copiado");
            rotular(principal.querySelector("[data-i18n]"), "descarga.enlace.copiado");
          }
        } catch {
          // Compartir cancelado: no pasa nada.
        }
      });
    }
  }
  escribirSistema();

  // ── Copiar la huella ──
  const copiar = document.querySelector<HTMLButtonElement>(".sha__copiar");
  let espera = 0;
  copiar?.addEventListener("click", async () => {
    if (!valor) return;
    try {
      await navigator.clipboard.writeText(valor.textContent?.trim() ?? "");
    } catch {
      // Sin portapapeles: se selecciona el texto para copiarlo a mano.
      const rango = document.createRange();
      rango.selectNodeContents(valor);
      getSelection()?.removeAllRanges();
      getSelection()?.addRange(rango);
      if (estadoCopia) estadoCopia.textContent = t("descarga.seleccionada");
      return;
    }
    copiar.textContent = t("descarga.copiado");
    if (estadoCopia) estadoCopia.textContent = t("descarga.copiado");
    clearTimeout(espera);
    espera = window.setTimeout(() => {
      copiar.textContent = t("descarga.copiar");
      if (estadoCopia) estadoCopia.textContent = "";
    }, 2000);
  });

  // Huellas de la lista: un clic copia la entera.
  for (const boton of document.querySelectorAll<HTMLButtonElement>(".paquete__sha")) {
    boton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(boton.dataset.sha ?? "");
        if (estadoCopia) estadoCopia.textContent = t("descarga.copiado");
      } catch {
        if (estadoCopia) estadoCopia.textContent = boton.dataset.sha ?? "";
      }
    });
  }

  document.addEventListener("prensa:idioma", () => {
    escribirSistema();
    escribirDetalle();
  });

  if (quieto) return;
  const sello = document.querySelector<HTMLElement>(".sello-grande");
  if (sello) {
    gsap.fromTo(
      sello,
      { scale: 1.6, opacity: 0, rotate: 6 },
      {
        scale: 1,
        opacity: 1,
        rotate: -8,
        ease: "power4.in",
        duration: 0.5,
        scrollTrigger: {
          trigger: ".descarga",
          start: "top 55%",
          toggleActions: "play none none reverse",
        },
      },
    );
  }
}
