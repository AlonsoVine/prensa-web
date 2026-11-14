// Grano de la sala: una baldosa de ruido que se genera una sola vez al arrancar
// y se repite como fondo. Es determinista (misma semilla, misma textura) y no
// cuesta nada por fotograma, a diferencia de un filtro de turbulencia en vivo.

const LADO = 160;

export function ponerGrano(): void {
  const lienzo = document.createElement("canvas");
  lienzo.width = LADO;
  lienzo.height = LADO;
  const contexto = lienzo.getContext?.("2d");
  // Sin canvas (algún entorno de pruebas) simplemente no hay grano.
  if (!contexto) return;

  const imagen = contexto.createImageData(LADO, LADO);
  let estado = 0x9e3779b9;
  for (let i = 0; i < imagen.data.length; i += 4) {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;
    const gris = estado >>> 24;
    imagen.data[i] = gris;
    imagen.data[i + 1] = gris;
    imagen.data[i + 2] = gris;
    // Transparencia variable: el grano aclara y oscurece sin velar el conjunto.
    imagen.data[i + 3] = (estado >>> 16) & 0xff;
  }
  contexto.putImageData(imagen, 0, 0);
  document.documentElement.style.setProperty("--textura-grano", `url(${lienzo.toDataURL()})`);
}
