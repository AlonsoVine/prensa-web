// Cara B: la galleta del autor gira con el scroll y seis cuerdas de guitarra
// vibran al pasar el cursor (o el dedo). Con el sonido activado suenan de verdad:
// síntesis Karplus-Strong, sin muestras ni ficheros de audio.
//
// Cejilla: el traste por el que pasas manda. Rasguear sobre el traste 4 suena
// como con la cejilla en el 4 (todas las cuerdas, 4 semitonos más agudas). El
// sonido es el mismo búfer reproducido 2^(n/12) más rápido: sube justo n
// semitonos y se apaga algo antes, como una nota pisada en una guitarra real.
import gsap from "gsap";
import { t } from "../i18n";

const SVG = "http://www.w3.org/2000/svg";
// De la sexta a la primera: Mi grave arriba, como al mirar la guitarra en brazos.
const CUERDAS = [
  { nota: "E", hz: 82.41, grosor: 3.2 },
  { nota: "A", hz: 110.0, grosor: 2.6 },
  { nota: "D", hz: 146.83, grosor: 2.1 },
  { nota: "G", hz: 196.0, grosor: 1.7 },
  { nota: "B", hz: 246.94, grosor: 1.3 },
  { nota: "e", hz: 329.63, grosor: 1.0 },
];
const MARGEN = 44;
const TRASTES = 12;

/** Posición x del traste n (0 = cejuela), con el espaciado real de una guitarra. */
function posicionTraste(n: number, ancho: number): number {
  return MARGEN + ((ancho - MARGEN) * (1 - 2 ** (-n / 12))) / 0.5;
}

/** Traste en el que cae x: 0 antes de la cejuela (al aire), 1–12 entre trastes. */
function trasteEn(x: number, ancho: number): number {
  if (x < MARGEN) return 0;
  for (let n = 1; n <= TRASTES; n++) if (x < posicionTraste(n, ancho)) return n;
  return TRASTES;
}

interface Estado {
  y: number;
  x: number;
  amplitud: number;
  t: number;
  frecuencia: number;
  /** Donde empieza la parte que vibra (la cejilla). */
  inicio: number;
  camino: SVGPathElement;
}

export function montarAutor(quieto: boolean): void {
  const galleta = document.querySelector<SVGSVGElement>(".autor__galleta svg");
  if (galleta && !quieto) {
    gsap.to(galleta, {
      rotate: 300,
      ease: "none",
      scrollTrigger: { trigger: ".autor", start: "top bottom", end: "bottom top", scrub: true },
    });
  }
  montarCuerdas(quieto);
}

function sintetizar(ctx: AudioContext, hz: number): AudioBuffer {
  const sr = ctx.sampleRate;
  const n = Math.round(sr / hz);
  const buffer = ctx.createBuffer(1, Math.round(sr * 2.6), sr);
  const datos = buffer.getChannelData(0);
  const anillo = new Float32Array(n);
  for (let i = 0; i < n; i++) anillo[i] = Math.random() * 2 - 1;
  let idx = 0;
  const amortiguacion = 0.996 - hz / 60000;
  for (let i = 0; i < datos.length; i++) {
    const actual = anillo[idx] ?? 0;
    const siguiente = anillo[(idx + 1) % n] ?? 0;
    anillo[idx] = (actual + siguiente) * 0.5 * amortiguacion;
    datos[i] = actual;
    idx = (idx + 1) % n;
  }
  return buffer;
}

// Trastes con el espaciado real de una guitarra (cada uno, 2^(1/12) más cerca
// del anterior), cejuela y marcadores en los trastes 3, 5, 7, 9 y 12.
function dibujarDiapason(grupo: SVGGElement, ancho: number, alto: number): void {
  grupo.replaceChildren();
  const traste = (n: number): number => posicionTraste(n, ancho);
  const nuevo = (nombre: string, attrs: Record<string, string | number>): void => {
    const nodo = document.createElementNS(SVG, nombre);
    for (const [k, v] of Object.entries(attrs)) nodo.setAttribute(k, String(v));
    grupo.append(nodo);
  };
  nuevo("rect", { x: MARGEN - 7, y: 0, width: 7, height: alto, class: "cejuela" });
  for (let n = 1; n <= 12; n++) {
    const x = Math.min(traste(n), ancho - 3);
    nuevo("line", { x1: x, y1: 0, x2: x, y2: alto, class: "traste" });
  }
  const medio = (n: number): number => (traste(n - 1) + traste(n)) / 2;
  const r = Math.max(4, alto * 0.035);
  for (const n of [3, 5, 7, 9])
    nuevo("circle", { cx: medio(n), cy: alto / 2, r, class: "marcador" });
  for (const y of [alto * 0.3, alto * 0.7]) {
    nuevo("circle", { cx: medio(12), cy: y, r, class: "marcador" });
  }
}

function montarCuerdas(quieto: boolean): void {
  const svg = document.querySelector<SVGSVGElement>(".mastil__cuerdas");
  const boton = document.querySelector<HTMLButtonElement>(".mastil__sonido");
  const ayuda = document.querySelector<HTMLElement>(".mastil__ayuda");
  if (!svg || !boton) return;
  // El diapasón va debajo de las cuerdas.
  const diapason = document.createElementNS(SVG, "g");
  svg.append(diapason);

  const tactil = matchMedia("(hover: none)").matches;
  const rotularAyuda = (): void => {
    if (ayuda) ayuda.textContent = t(tactil ? "autor.cuerdas.tactil" : "autor.cuerdas");
  };
  rotularAyuda();

  let ancho = 1000;
  let alto = 200;
  const estados: Estado[] = CUERDAS.map((c) => {
    const camino = document.createElementNS(SVG, "path");
    camino.setAttribute("stroke-width", String(c.grosor));
    svg.append(camino);
    return { y: 0, x: 0, amplitud: 0, t: 0, frecuencia: 7 + c.hz / 40, inicio: MARGEN, camino };
  });

  // Zona del traste activo y su número: se ve dónde está la cejilla.
  const zona = document.createElementNS(SVG, "rect");
  zona.setAttribute("class", "mastil__zona");
  const cifraZona = document.createElementNS(SVG, "text");
  cifraZona.setAttribute("class", "mastil__cifra");
  diapason.after(zona);
  zona.after(cifraZona);
  let cejilla = 0;
  const marcarCejilla = (n: number): void => {
    cejilla = n;
    if (n === 0) {
      zona.setAttribute("width", "0");
      cifraZona.textContent = "";
      return;
    }
    const x0 = posicionTraste(n - 1, ancho);
    const x1 = Math.min(posicionTraste(n, ancho), ancho);
    zona.setAttribute("x", String(x0));
    zona.setAttribute("y", "0");
    zona.setAttribute("width", String(Math.max(0, x1 - x0)));
    zona.setAttribute("height", String(alto));
    cifraZona.setAttribute("x", String((x0 + x1) / 2));
    cifraZona.setAttribute("y", String(alto - 6));
    cifraZona.textContent = String(n);
  };
  const notas = CUERDAS.map((c) => {
    const texto = document.createElementNS(SVG, "text");
    texto.textContent = c.nota;
    texto.setAttribute("class", "mastil__nota");
    svg.append(texto);
    return texto;
  });

  const dibujar = (e: Estado, desplazamiento: number): void => {
    // Solo vibra el tramo entre la cejilla y el puente; el resto queda quieto.
    const x = gsap.utils.clamp(e.inicio + 20, ancho - 20, e.x);
    e.camino.setAttribute(
      "d",
      `M${MARGEN},${e.y} L${e.inicio},${e.y} Q${x},${e.y + desplazamiento * 2} ${ancho},${e.y}`,
    );
    e.camino.classList.toggle("vibrando", Math.abs(desplazamiento) > 0.6);
  };

  const medir = (): void => {
    const caja = svg.getBoundingClientRect();
    ancho = Math.max(200, caja.width);
    alto = Math.max(80, caja.height);
    svg.setAttribute("viewBox", `0 0 ${ancho} ${alto}`);
    dibujarDiapason(diapason, ancho, alto);
    estados.forEach((e, i) => {
      e.y = (alto * (i + 0.75)) / (CUERDAS.length + 0.5);
      notas[i]?.setAttribute("x", "8");
      notas[i]?.setAttribute("y", String(e.y + 4));
      dibujar(e, 0);
    });
    marcarCejilla(cejilla);
  };
  medir();
  new ResizeObserver(medir).observe(svg);

  // ── Sonido ──
  let audio: AudioContext | null = null;
  let buffers: AudioBuffer[] = [];
  let sonido = false;
  const tocar = (i: number, fuerza: number, semitonos: number): void => {
    const buffer = buffers[i];
    if (!sonido || !audio || !buffer) return;
    const fuente = audio.createBufferSource();
    fuente.buffer = buffer;
    fuente.playbackRate.value = 2 ** (semitonos / 12);
    const ganancia = audio.createGain();
    ganancia.gain.value = 0.12 + 0.25 * fuerza;
    const filtro = audio.createBiquadFilter();
    filtro.type = "lowpass";
    filtro.frequency.value = 2200 + 2600 * fuerza;
    fuente.connect(filtro).connect(ganancia).connect(audio.destination);
    fuente.start();
  };
  const rotularBoton = (): void => {
    boton.setAttribute("aria-pressed", String(sonido));
    const texto = boton.querySelector("[data-i18n]");
    if (texto) {
      const clave = sonido ? "autor.sonido.on" : "autor.sonido.off";
      texto.setAttribute("data-i18n", clave);
      texto.textContent = t(clave);
    }
  };
  boton.addEventListener("click", async () => {
    sonido = !sonido;
    if (sonido && !audio) {
      const ctx = new AudioContext();
      audio = ctx;
      buffers = CUERDAS.map((c) => sintetizar(ctx, c.hz));
    }
    if (audio?.state === "suspended") await audio.resume();
    rotularBoton();
    if (sonido) tocar(0, 0.5, cejilla);
  });
  document.addEventListener("prensa:idioma", () => {
    rotularBoton();
    rotularAyuda();
  });

  // ── Vibración ──
  let animando = false;
  const bucle = (_: number, dtMs: number): void => {
    const dt = Math.min(dtMs, 50) / 1000;
    let alguna = false;
    for (const e of estados) {
      if (e.amplitud === 0) continue;
      e.t += dt;
      const envolvente = Math.exp(-e.t / 0.9);
      if (Math.abs(e.amplitud * envolvente) < 0.15) {
        e.amplitud = 0;
        dibujar(e, 0);
        continue;
      }
      alguna = true;
      dibujar(e, e.amplitud * envolvente * Math.cos(2 * Math.PI * e.frecuencia * e.t));
    }
    if (!alguna) {
      gsap.ticker.remove(bucle);
      animando = false;
    }
  };
  const pulsar = (i: number, x: number, fuerza: number, traste = cejilla): void => {
    const e = estados[i];
    if (!e) return;
    tocar(i, gsap.utils.clamp(0, 1, fuerza), traste);
    if (quieto) return;
    e.x = x;
    e.t = 0;
    e.inicio = traste > 0 ? posicionTraste(traste, ancho) : MARGEN;
    // La cuerda pisada vibra más deprisa, como su nota.
    e.frecuencia = (7 + (CUERDAS[i]?.hz ?? 110) / 40) * 2 ** (traste / 12);
    e.amplitud = (6 + 10 * gsap.utils.clamp(0, 1, fuerza)) * (Math.random() > 0.5 ? 1 : -1);
    if (!animando) {
      animando = true;
      gsap.ticker.add(bucle);
    }
  };

  // Teclado: 1–6 pulsan cada cuerda (la 1 es la más aguda, como en la guitarra)
  // y Intro o Espacio rasguean todas.
  svg.setAttribute("tabindex", "0");
  const anuncio = document.querySelector<HTMLElement>(".mastil__anuncio");
  svg.addEventListener("keydown", (ev) => {
    const n = Number(ev.key);
    const centro = (posicionTraste(cejilla, ancho) + ancho) / 2;
    if (n >= 1 && n <= CUERDAS.length) {
      ev.preventDefault();
      pulsar(CUERDAS.length - n, centro, 0.7);
    } else if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      CUERDAS.forEach((_, i) => setTimeout(() => pulsar(i, centro, 0.6), i * 35));
    } else if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
      ev.preventDefault();
      marcarCejilla(gsap.utils.clamp(0, TRASTES, cejilla + (ev.key === "ArrowRight" ? 1 : -1)));
      if (anuncio)
        anuncio.textContent = cejilla ? t("autor.cejilla", { n: cejilla }) : t("autor.alAire");
    }
  });

  const local = (ev: PointerEvent): { x: number; y: number } => {
    const caja = svg.getBoundingClientRect();
    return {
      x: ((ev.clientX - caja.left) / caja.width) * ancho,
      y: ((ev.clientY - caja.top) / caja.height) * alto,
    };
  };
  let anterior: { x: number; y: number; t: number } | null = null;
  svg.addEventListener("pointermove", (ev) => {
    const p = local(ev);
    const ahora = performance.now();
    const previo = anterior;
    if (previo) {
      const velocidad = Math.abs(p.y - previo.y) / Math.max(1, ahora - previo.t);
      estados.forEach((e, i) => {
        if ((previo.y - e.y) * (p.y - e.y) < 0)
          pulsar(i, p.x, velocidad * 0.9, trasteEn(p.x, ancho));
      });
    }
    anterior = { ...p, t: ahora };
    marcarCejilla(trasteEn(p.x, ancho));
  });
  svg.addEventListener("pointerleave", () => {
    anterior = null;
    marcarCejilla(0);
  });
  svg.addEventListener("pointerdown", (ev) => {
    const p = local(ev);
    let cerca = 0;
    estados.forEach((e, i) => {
      if (Math.abs(e.y - p.y) < Math.abs((estados[cerca]?.y ?? 0) - p.y)) cerca = i;
    });
    const traste = trasteEn(p.x, ancho);
    marcarCejilla(traste);
    pulsar(cerca, p.x, 0.7, traste);
  });
}
