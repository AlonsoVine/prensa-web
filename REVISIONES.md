# Rondas de revisión

Cada ronda: se compila la web, se fotografía (1920 ES, 1280 EN, 390 ES y 1440 con
movimiento reducido) y un jurado sin contexto la puntúa con los criterios de
Awwwards (Diseño 40 %, Usabilidad 30 %, Creatividad 20 %, Contenido 10 %), más
rendimiento y accesibilidad aparte. Después se corrige y se hace commit.

| Ronda | Foco | Diseño | Usab. | Creat. | Cont. | **Total** | Rend. | Acces. |
| ----- | ---- | -----: | ----: | -----: | ----: | --------: | ----: | -----: |
| 1 | Impresión global y diseño | 7,4 | 6,6 | 7,0 | 7,6 | **7,10** | 7,5 | 7,0 |

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
