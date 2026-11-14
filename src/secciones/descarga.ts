// Descarga: detecta el sistema, copia la huella SHA-256 y estampa el sello.
import gsap from "gsap";
import { NOMBRE_SISTEMA, sistemaDelVisitante } from "../content/descarga";
import { t } from "../i18n";

export function montarDescarga(quieto: boolean): void {
  const tuyo = document.querySelector<HTMLElement>(".descarga__tuyo");
  const sistema = sistemaDelVisitante();
  const escribirSistema = (): void => {
    if (!tuyo || sistema === "otro") return;
    tuyo.hidden = false;
    tuyo.textContent = t("descarga.tuyo", { so: NOMBRE_SISTEMA[sistema] });
  };
  escribirSistema();

  const copiar = document.querySelector<HTMLButtonElement>(".sha__copiar");
  const valor = document.querySelector<HTMLElement>(".sha__valor");
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
      return;
    }
    copiar.textContent = t("descarga.copiado");
    clearTimeout(espera);
    espera = window.setTimeout(() => (copiar.textContent = t("descarga.copiar")), 2000);
  });

  document.addEventListener("prensa:idioma", escribirSistema);

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
