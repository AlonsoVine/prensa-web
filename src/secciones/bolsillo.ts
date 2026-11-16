// «También en Android»: el teléfono con la estantería real de la app. Al
// cruzar la pantalla, un single de 7″ sale de detrás del teléfono girando y el
// teléfono se endereza. La captura cambia de idioma con la página.
import gsap from "gsap";
import { opcionPara, sistemaDelVisitante } from "../content/descarga";
import { alCambiarIdioma } from "../i18n";

export function montarBolsillo(quieto: boolean): void {
  const seccion = document.querySelector<HTMLElement>(".bolsillo");
  const escena = seccion?.querySelector<HTMLElement>(".bolsillo__escena");
  const captura = seccion?.querySelector<HTMLImageElement>(".telefono__captura");
  if (!seccion || !escena || !captura) return;

  // Si hay APK publicado, el botón lo descarga directamente (salvo en iPhone,
  // donde no serviría: allí lleva a la tarjeta de descarga, que explica por qué).
  const apk = opcionPara("android");
  const boton = seccion.querySelector<HTMLAnchorElement>("[data-android]");
  if (apk && boton && sistemaDelVisitante() !== "ios") {
    boton.href = apk.url;
    boton.setAttribute("download", "");
  }

  alCambiarIdioma((idioma) => {
    captura.src = `capturas/movil-estanteria${idioma === "en" ? "--en" : ""}.webp`;
  });
  if (document.documentElement.lang === "en") captura.src = "capturas/movil-estanteria--en.webp";

  if (quieto) {
    escena.style.setProperty("--sale", "1");
    return;
  }
  const estado = { sale: 0 };
  gsap.to(estado, {
    sale: 1,
    ease: "none",
    onUpdate: () => escena.style.setProperty("--sale", estado.sale.toFixed(4)),
    scrollTrigger: { trigger: escena, start: "top 85%", end: "center 40%", scrub: 0.6 },
  });
}
