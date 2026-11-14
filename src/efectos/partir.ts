// Parte un texto en palabras o letras, cada una dentro de una máscara, para
// que pueda entrar desde abajo. Respeta el marcado propio (<em>, <br>) y los
// espacios duros, y deja el texto completo legible para lectores de pantalla.

export type Modo = "palabras" | "letras";

export function partir(el: HTMLElement, modo: Modo = "palabras"): HTMLElement[] {
  const piezas: HTMLElement[] = [];
  el.querySelector(":scope > .partido__lectura")?.remove();
  const texto = el.textContent?.replace(/\s+/g, " ").trim() ?? "";

  const recorrer = (nodo: Node): void => {
    for (const hijo of [...nodo.childNodes]) {
      if (hijo.nodeType === Node.TEXT_NODE) {
        const fragmento = document.createDocumentFragment();
        // Solo se parte por espacios normales: el espacio duro mantiene unidas dos palabras.
        for (const trozo of (hijo.textContent ?? "").split(/([ \n\t]+)/)) {
          if (!trozo) continue;
          if (/^[ \n\t]+$/.test(trozo)) {
            fragmento.append(" ");
            continue;
          }
          const palabra = envolver(trozo, "palabra");
          if (modo === "letras") {
            palabra.textContent = "";
            for (const letra of [...trozo]) {
              const l = envolver(letra, "letra");
              palabra.append(l.parentElement as HTMLElement);
              piezas.push(l);
            }
            // En modo letras la máscara va por letra: la palabra queda como contenedor.
            const contenedor = palabra.parentElement as HTMLElement;
            contenedor.classList.remove("mascara");
          } else {
            piezas.push(palabra);
          }
          fragmento.append(palabra.parentElement as HTMLElement);
        }
        hijo.replaceWith(fragmento);
      } else if (hijo.nodeType === Node.ELEMENT_NODE && (hijo as Element).tagName !== "BR") {
        recorrer(hijo);
      }
    }
  };
  recorrer(el);

  // Los lectores de pantalla leen una copia entera y oculta (aria-label en un <p>
  // o un <h2> no se anuncia de forma fiable); las piezas quedan fuera del árbol.
  if (!el.hasAttribute("aria-hidden") && texto) {
    for (const hijo of el.children) hijo.setAttribute("aria-hidden", "true");
    const lectura = document.createElement("span");
    lectura.className = "oculto partido__lectura";
    lectura.textContent = texto;
    el.append(lectura);
  }
  el.classList.add("partido");
  return piezas;
}

function envolver(texto: string, clase: string): HTMLElement {
  const mascara = document.createElement("span");
  mascara.className = "mascara";
  const pieza = document.createElement("span");
  pieza.className = clase;
  pieza.textContent = texto;
  mascara.append(pieza);
  return pieza;
}
