# Rondas de revisión

Cada ronda: se compila la web, se fotografía (1920 ES, 1280 EN, 390 ES y 1440 con
movimiento reducido) y un jurado sin contexto la puntúa con los criterios de
Awwwards (Diseño 40 %, Usabilidad 30 %, Creatividad 20 %, Contenido 10 %), más
rendimiento y accesibilidad aparte. Después se corrige y se hace commit.

| Ronda | Foco | Diseño | Usab. | Creat. | Cont. | **Total** | Rend. | Acces. |
| ----- | ---- | -----: | ----: | -----: | ----: | --------: | ----: | -----: |
| 1 | Impresión global y diseño | 7,4 | 6,6 | 7,0 | 7,6 | **7,10** | 7,5 | 7,0 |
| 2 | Movimiento y creatividad | 7,4 | 6,6 | 7,2 | 7,8 | **7,20** | 6,5 | 6,4 |
| 3 | Usabilidad, móvil y accesibilidad | 7,6 | 6,4 | 7,8 | 7,7 | **7,30** | 8,4 | 6,6 |

## Ronda 1 → cambios

- **Un solo disco para toda la página**: el vinilo WebGL sale del hero, se aparta
  junto al manifiesto, se retira antes de «Cómo funciona» y vuelve, prensado,
  detrás de «Tu música, prensada». Capa fija recortada por un marco.
- Galería de capturas en ~3 pantallas de scroll (antes ~10), sin zoom ni deriva.
- Arreglado `{mb}`/`{version}` sin sustituir en inglés; «Lado»/«Cat.» traducidos.
- Fuera el `mix-blend-mode: difference` del titular (teñía de cian la etiqueta).
- Nueva sección en papel: **«¿Por qué una app y no una web?»**, con la columna de
  la web tachándose fila a fila.
- Descarga centrada: botón más grande de la página y el sello entero sobre la tarjeta.
- El mástil de guitarra es ahora un diapasón: trastes con espaciado real, cejuela
  y marcadores.
- Pie: el rótulo gigante cambia por un anillo de catálogo que gira con el scroll.
- «33⅓» se leía «33 %» en DM Mono: ahora «33 1/3». Rótulos de 11 a 12 px y más contraste.
- Miniaturas de la escena con arte como las de la app.
- Corregido un desbordamiento que en móvil ensanchaba el viewport a 806 px
  (grid implícito del manifiesto); el test ahora lo detecta.

## Ronda 2 → cambios

- **El disco vuela al plato de la app en miniatura** de «Cómo funciona» y se prensa
  allí, surco a surco, al ritmo de los pasos; al salir devuelve el hueco al plato SVG.
- **33 1/3 rpm de verdad** (3,49 rad/s) y el contador muestra las rpm reales del disco;
  solo se escribe cuando cambia.
- El brillo sigue a la luz por el arco más corto (antes daba una vuelta al cruzar ±π).
- El visor de capturas ya no salta al principio de la página (`main > *` alcanzaba al `<dialog>`).
- El disco del final sigue a su sección: el pie ya no lo corta. La etiqueta roja
  queda bajo un botón en hueso, no bajo «PRENSADA.».
- Aguja del vúmetro movida por el tiempo, no por el scroll.
- Cinta: el ancho se cachea (antes forzaba un reflow por fotograma).
- Intro ~1,2 s; la precarga solo sale en la primera visita de la sesión.
- Cursor: etiqueta pequeña «Ampliar» junto al puntero en vez de un disco rojo.
- Cuerdas de guitarra tocables con teclado (1–6 e Intro).
- Texto partido accesible con copia oculta en vez de `aria-label` en `<p>`.
- `.titulo` con interlineado 0,92 («¿» ya no choca); escena sin desbordar en móvil;
  botones sin partir línea; dpr máx. 1,5 y empuje del scroll escalado por fotograma.

## Ronda 3 → cambios

- **macOS y Linux**: instaladores del CI de prensa-app (`.dmg` Apple Silicon, AppImage
  y `.deb`). La web ofrece el del sistema del visitante (botones, peso, huella, aviso
  de Gatekeeper o `chmod +x`) y lista todas las descargas con su SHA-256. Los paquetes
  de Linux pasan de 100 MB: se sirven, pero no se versionan (`.gitignore`).
- **Móvil**: ya no ofrece un `.exe`; las llamadas llevan a la tarjeta, que propone
  enviarse el enlace (compartir nativo o copiar).
- Las capturas salen en inglés desde la carga con `?lang=en` (el idioma inicial no
  avisaba a los módulos); el cambio de idioma se refleja en la URL.
- Cabecera con fondo sólido y desenfoque; botón de idioma con nombre accesible igual
  a lo visible.
- Galería fijada: el foco de teclado lleva el scroll hasta la captura enfocada.
- «Cómo funciona» no se fija en móvil (escena acabada y los tres pasos legibles); en
  escritorio el tramo fijado baja de 3,2 a 2,6 pantallas.
- Cinta con botón de pausa y parada al pasar el puntero (WCAG 2.2.2).
- «Copiada» anunciado con `role="status"`; aviso si el portapapeles falla.
- Objetivos táctiles de 44 px; botón de descarga a ancho completo en móvil; sello sin salirse.
- Manifiesto apagado a 0,4 de opacidad (antes 0,16); pasos inactivos a 0,6 y sus
  descripciones accesibles; H2 oculto en el manifiesto; alt del visor sin duplicar.
