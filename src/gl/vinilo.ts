// El vinilo del hero, pintado en un único shader sobre un triángulo a pantalla.
//
// Todo es procedimental salvo la etiqueta (un canvas 2D con la tipografía de la
// marca): surcos con microrrelieve, separaciones entre pistas, brillo anisótropo
// que sigue a la luz (el cursor) y polvo que gira con el disco. `prensado` dibuja
// los surcos de fuera hacia dentro, como la barra de progreso de la app.

import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";

const VERTICE = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENTO = /* glsl */ `
precision highp float;
uniform float uRot;
uniform float uPx;
uniform float uPrensado;
uniform float uLuz;
uniform float uIntensidad;
uniform sampler2D uEtiqueta;
varying vec2 vUv;

float hash(float n) { return fract(sin(n) * 43758.5453123); }
float ruido(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash(i), hash(i + 1.0), f * f * (3.0 - 2.0 * f));
}

void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float r = length(p);
  float aa = uPx * 1.5;
  float disco = 1.0 - smoothstep(0.985 - aa, 0.985, r);
  if (disco <= 0.0) discard;

  float ang = atan(p.y, p.x);
  vec3 negro = vec3(0.036, 0.032, 0.029);
  vec3 luz = vec3(1.0, 0.95, 0.86);

  const float R_ETIQUETA = 0.335;
  const float R_INICIO = 0.37;
  const float R_FIN = 0.952;

  // Brillo anisótropo: dos lóbulos opuestos alineados con la luz.
  float c = abs(cos(ang - uLuz));
  float lobulo = pow(c, 22.0);
  float halo = pow(c, 3.0);

  // Zona con surcos y frente de prensado (de fuera hacia dentro).
  float enSurcos = smoothstep(R_INICIO, R_INICIO + 0.006, r) * (1.0 - smoothstep(R_FIN, R_FIN + 0.006, r));
  float frente = mix(R_FIN + 0.02, R_INICIO - 0.02, uPrensado);
  float prensado = smoothstep(frente - 0.012, frente + 0.012, r);

  // Microrrelieve de los surcos: muy fino, con algo de irregularidad.
  float g = sin(r * 1100.0 + ruido(r * 70.0) * 7.0) * 0.5 + 0.5;
  float banda = ruido(r * 38.0);

  // Separaciones entre pistas: anillos lisos y más brillantes.
  float pausas = 0.0;
  for (int i = 0; i < 6; i++) {
    float rp = 0.43 + 0.088 * float(i);
    pausas += 1.0 - smoothstep(0.0015, 0.0045, abs(r - rp));
  }
  pausas = clamp(pausas, 0.0, 1.0);

  vec3 surcos = negro + vec3(0.022) * g * (0.6 + banda)
    + luz * lobulo * (0.26 + 0.24 * g) * uIntensidad
    + luz * halo * 0.035;
  surcos = mix(surcos, negro * 0.7 + luz * (lobulo * 0.55 + halo * 0.05) * uIntensidad, pausas * 0.85);

  vec3 liso = negro + luz * (pow(c, 7.0) * 0.12 + halo * 0.02) * uIntensidad;
  vec3 col = mix(liso, surcos, prensado * enSurcos);
  col = mix(liso, col, enSurcos);

  // Línea roja del frente de prensado mientras avanza.
  float filo = (1.0 - smoothstep(0.0, 0.006, abs(r - frente))) * step(0.001, uPrensado) * step(uPrensado, 0.999);
  col = mix(col, vec3(0.95, 0.25, 0.12), filo * enSurcos * 0.9);

  // Polvo que gira con el disco (lo único que delata el giro en los surcos).
  float celda = floor((ang - uRot) * 160.0) + floor(r * 140.0) * 13.0;
  col += vec3(step(0.9985, hash(celda)) * 0.22) * enSurcos;

  // Canto del disco.
  col += luz * 0.06 * smoothstep(0.955, 0.982, r) * (0.4 + halo);

  // Etiqueta: gira con el disco.
  float enEtiqueta = 1.0 - smoothstep(R_ETIQUETA - aa, R_ETIQUETA, r);
  if (enEtiqueta > 0.0) {
    float s = sin(uRot);
    float co = cos(uRot);
    vec2 q = mat2(co, -s, s, co) * p;
    vec4 et = texture2D(uEtiqueta, q / (R_ETIQUETA * 2.0) + 0.5);
    vec3 etCol = et.rgb + luz * pow(c, 4.0) * 0.06;
    col = mix(col, etCol, enEtiqueta * et.a);
  }

  // Agujero central.
  float agujero = smoothstep(0.02, 0.02 + aa, r);
  float a = disco * agujero;
  gl_FragColor = vec4(col * a, a);
}
`;

function pintarEtiqueta(texto: string): HTMLCanvasElement {
  const lado = 1024;
  const lienzo = document.createElement("canvas");
  lienzo.width = lado;
  lienzo.height = lado;
  const g = lienzo.getContext("2d");
  if (!g) return lienzo;
  const c = lado / 2;

  g.fillStyle = "#f2401f";
  g.beginPath();
  g.arc(c, c, c, 0, Math.PI * 2);
  g.fill();

  // Anillo fino interior, como el de una galleta impresa.
  g.strokeStyle = "rgba(14,12,10,0.55)";
  g.lineWidth = 3;
  g.beginPath();
  g.arc(c, c, c * 0.93, 0, Math.PI * 2);
  g.stroke();

  // Texto en círculo.
  g.fillStyle = "#0e0c0a";
  g.font = '500 44px "DM Mono", monospace';
  g.textAlign = "center";
  g.textBaseline = "middle";
  const radio = c * 0.8;
  const letras = [...texto];
  const paso = (Math.PI * 2) / letras.length;
  letras.forEach((letra, i) => {
    const a = i * paso - Math.PI / 2;
    g.save();
    g.translate(c + Math.cos(a) * radio, c + Math.sin(a) * radio);
    g.rotate(a + Math.PI / 2);
    g.fillText(letra, 0, 0);
    g.restore();
  });

  // Marca en el centro.
  g.font = '900 150px "Big Shoulders", "Arial Narrow", sans-serif';
  g.fillText("PRENSA", c, c - 150);
  g.font = '500 34px "DM Mono", monospace';
  g.fillText("LADO A · 33 1/3", c, c + 150);

  g.fillStyle = "#0e0c0a";
  g.beginPath();
  g.arc(c, c, 34, 0, Math.PI * 2);
  g.fill();
  return lienzo;
}

export interface Vinilo {
  /** Empuje de giro (p. ej., la velocidad del scroll). */
  empujar(velocidad: number): void;
  /** Ángulo de la luz en radianes. */
  luz(angulo: number): void;
  prensado(valor: number): void;
  /** Revoluciones por minuto reales en este momento. */
  rpm(): number;
  /** Pinta un fotograma; `dt` en segundos. */
  pintar(dt: number): void;
  activo(si: boolean): void;
}

export async function montarVinilo(
  lienzo: HTMLCanvasElement,
  quieto: boolean,
): Promise<Vinilo | null> {
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas: lienzo,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }
  const gl = renderer.gl;
  if (!gl) return null;
  gl.clearColor(0, 0, 0, 0);

  await Promise.allSettled([
    document.fonts.load('900 150px "Big Shoulders"'),
    document.fonts.load('500 44px "DM Mono"'),
  ]);

  const textura = new Texture(gl, {
    image: pintarEtiqueta("PRENSA · MATRIZ A · PRS-001 · 33 1/3 RPM · HECHO EN MADRID · "),
    generateMipmaps: true,
    minFilter: gl.LINEAR_MIPMAP_LINEAR,
  });

  const programa = new Program(gl, {
    vertex: VERTICE,
    fragment: FRAGMENTO,
    transparent: true,
    uniforms: {
      uRot: { value: 0 },
      uPx: { value: 0.002 },
      uPrensado: { value: quieto ? 1 : 0 },
      uLuz: { value: 0.9 },
      uIntensidad: { value: 1 },
      uEtiqueta: { value: textura },
    },
  });
  const malla = new Mesh(gl, { geometry: new Triangle(gl), program: programa });

  // OGL fija el tamaño en el estilo del canvas al crearlo (300 × 150): se mide
  // siempre el contenedor, que es quien manda.
  const caja = lienzo.parentElement ?? lienzo;
  const medir = (): void => {
    const ancho = caja.clientWidth;
    const alto = caja.clientHeight;
    if (!ancho || !alto) return;
    renderer.setSize(ancho, alto);
    programa.uniforms.uPx.value = 2 / (ancho * renderer.dpr);
  };
  medir();
  new ResizeObserver(() => {
    medir();
    pintar(0);
  }).observe(caja);

  let rot = 0;
  // 33 1/3 rpm de verdad: 2π · 33,33 / 60 ≈ 3,49 rad/s.
  const RPM_BASE = 100 / 3;
  const velocidad = (RPM_BASE * 2 * Math.PI) / 60;
  let empuje = 0;
  let luzObjetivo = 0.9;
  let luzActual = 0.9;
  let visible = true;

  const pintar = (dt: number): void => {
    if (!visible) return;
    if (!quieto) {
      empuje *= Math.pow(0.04, dt);
      rot += (velocidad + empuje) * dt;
      // Por el arco más corto: si no, al cruzar ±π el brillo daba una vuelta entera.
      const delta = Math.atan2(
        Math.sin(luzObjetivo - luzActual),
        Math.cos(luzObjetivo - luzActual),
      );
      luzActual += delta * Math.min(1, dt * 4);
    }
    programa.uniforms.uRot.value = rot;
    programa.uniforms.uLuz.value = luzActual;
    renderer.render({ scene: malla });
  };

  lienzo.classList.add("listo");
  pintar(0);

  return {
    empujar(v) {
      empuje = Math.max(-6, Math.min(6, empuje + v));
    },
    rpm() {
      return ((velocidad + empuje) * 60) / (2 * Math.PI);
    },
    luz(angulo) {
      luzObjetivo = angulo;
      if (quieto) luzActual = angulo;
    },
    prensado(valor) {
      programa.uniforms.uPrensado.value = valor;
    },
    pintar,
    activo(si) {
      visible = si;
    },
  };
}
