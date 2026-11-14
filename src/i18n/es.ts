// Textos en español. Son la fuente: el HTML se rellena con ellos al compilar
// (ver vite.config.ts) y el cambio de idioma los sustituye en vivo.
// Las claves que terminan en `_html` llevan marcado propio (<em>, <br>).

export const es = {
  "meta.title": "Prensa: tus listas de YouTube, prensadas en MP3",
  "meta.desc":
    "Prensa es una app de escritorio gratuita que convierte una lista pública de YouTube en una carpeta de MP3 con título, artista y carátula. En local, sin cuentas y sin telemetría.",

  saltar: "Saltar al contenido",
  "nav.como": "Cómo funciona",
  "nav.capturas": "Capturas",
  "nav.ficha": "Ficha",
  "nav.autor": "Autor",
  "nav.descargar": "Descargar",
  "nav.idioma": "Cambiar a inglés",
  "nav.principal": "Principal",

  "precarga.texto": "Prensando matriz",

  "hero.rotulo": "Matriz A · 33⅓ rpm · Edición",
  "hero.lema_html": "Tus listas de YouTube, <em>prensadas</em> en&nbsp;MP3.",
  "hero.sub":
    "Una app de escritorio que convierte una lista pública en una carpeta de canciones con título, artista y carátula. Todo pasa en tu equipo.",
  "hero.cta": "Descargar para Windows",
  "hero.cta2": "Cómo funciona",
  "hero.gratis": "Gratis",
  "hero.aguja": "Baja la aguja",
  "hero.disco": "Disco de vinilo con la etiqueta roja de Prensa, girando.",

  "cinta.1": "Sin cuentas",
  "cinta.2": "Sin cookies",
  "cinta.3": "Sin telemetría",
  "cinta.4": "MP3 V0 o 320 kbps",
  "cinta.5": "Carátula incrustada",
  "cinta.6": "Álbum y nº de pista",
  "cinta.7": "Reanudable",
  "cinta.8": "Motor que se actualiza solo",

  "manifiesto.rotulo": "Cara A · El manifiesto",
  "manifiesto.texto":
    "Pegas un enlace, revisas las pistas y eliges carpeta. Prensa hace el resto: cada canción sale como un MP3 limpio, con su nombre, su artista y su portada. Sin cuentas, sin cookies y sin que nada salga de tu equipo.",
  "principio.1.t": "En local",
  "principio.1.d":
    "No hay servidor ni analítica. Solo habla con YouTube, para leer la lista, y con GitHub, para actualizar el motor.",
  "principio.2.t": "Sin cuentas",
  "principio.2.d":
    "No pide, lee ni guarda credenciales ni cookies. Funciona con listas públicas o no listadas.",
  "principio.3.t": "Reanudable",
  "principio.3.d":
    "Si cortas a mitad, lo ya prensado no se repite. Lo que falla te dice por qué y puedes reintentar solo eso.",

  "como.rotulo": "Cómo funciona",
  "como.titulo_html": "Tres pasos.<br>Una prensa.",
  "paso.1.t": "Pega",
  "paso.1.d":
    "Copia el enlace de una lista pública de YouTube o YouTube Music. Prensa lo valida al instante y rechaza las listas ligadas a una cuenta antes de llamar a nadie.",
  "paso.2.t": "Revisa",
  "paso.2.d":
    "Aparecen las pistas con su duración y su miniatura. Marca las que quieres, elige carpeta y sabrás qué vídeos no están disponibles antes de empezar.",
  "paso.3.t": "Prensa",
  "paso.3.d":
    "Cada pista se descarga y se convierte a MP3 con título, artista, álbum, número y carátula. El disco se llena de surcos y, al final, el sello.",
  "escena.miga.1": "Enlace",
  "escena.miga.2": "Pistas",
  "escena.miga.3": "Descarga",
  "escena.boton": "Leer lista",
  "escena.cola": "En cola",
  "escena.bajando": "Prensando",
  "escena.hecha": "Guardada",
  "escena.sello": "Prensado",
  "escena.pistas": "5 pistas · 21 min",
  "escena.lista": "Grabaciones de campo",

  "capturas.rotulo": "La app, tal cual",
  "capturas.titulo_html": "Capturas reales,<br>sin retoques.",
  "capturas.sub":
    "Cada imagen sale de las pruebas automáticas de la app. Lo que ves es lo que hay.",
  "capturas.ampliar": "Ampliar",
  "capturas.cerrar": "Cerrar",
  "capturas.anterior": "Anterior",
  "capturas.siguiente": "Siguiente",
  "capturas.arrastra": "Desliza",
  "cap.inicio.t": "Pega una lista",
  "cap.inicio.d": "La portada: un campo, un botón y la matriz esperando.",
  "cap.lista.t": "Revisa las pistas",
  "cap.lista.d": "Selección por rango, duraciones y avisos antes de empezar.",
  "cap.descargando.t": "Prensando",
  "cap.descargando.d": "Dos pistas a la vez. El vúmetro marca la velocidad y el disco, el avance.",
  "cap.completado.t": "Prensado",
  "cap.completado.d": "Todo en tu carpeta, con el sello y un botón para abrirla.",
  "cap.parcial.t": "Casi todo",
  "cap.parcial.d": "Lo que no se pudo guardar aparece arriba, con su motivo.",
  "cap.lista-claro.t": "A plena luz",
  "cap.lista-claro.d": "Tema claro: la hoja de pedido sobre la mesa.",
  "cap.bloqueo.t": "Errores honestos",
  "cap.bloqueo.d": "Si YouTube bloquea la conexión, Prensa para y te explica por qué.",
  "cap.ajustes.t": "Ajustes",
  "cap.ajustes.d": "Calidad V0 o 320 kbps, tema, idioma y miniaturas.",

  "ficha.rotulo": "Contraportada",
  "ficha.titulo": "La ficha técnica",
  "ficha.formato.k": "Formato",
  "ficha.formato.v": "MP3 · VBR V0 o 320 kbps",
  "ficha.etiquetas.k": "Etiquetas",
  "ficha.etiquetas.v": "Título, artista, álbum, nº de pista y carátula",
  "ficha.carpeta.k": "Carpeta",
  "ficha.carpeta.v": "‹carpeta›/‹lista›/‹nº› - ‹título›.mp3",
  "ficha.fuentes.k": "Admite",
  "ficha.fuentes.v": "youtube.com · music.youtube.com · youtu.be",
  "ficha.motor.k": "Motor",
  "ficha.motor.v": "yt-dlp y ffmpeg incluidos, verificados por SHA-256",
  "ficha.update.k": "Al día",
  "ficha.update.v": "yt-dlp se actualiza solo desde GitHub",
  "ficha.idiomas.k": "Interfaz",
  "ficha.idiomas.v": "Español e inglés · tema claro y oscuro",
  "ficha.privacidad.k": "Privacidad",
  "ficha.privacidad.v": "Sin cuentas, cookies, servidor ni telemetría",
  "ficha.hecho.k": "Hecha con",
  "ficha.hecho.v": "Tauri 2 · Rust · React · TypeScript",

  "descarga.rotulo": "Llévatela",
  "descarga.titulo_html": "Pon la aguja<br>en tu equipo.",
  "descarga.boton": "Descargar para Windows",
  "descarga.detalle": "Instalador · x64 · {mb} MB · v{version}",
  "descarga.sha": "Huella SHA-256",
  "descarga.copiar": "Copiar",
  "descarga.copiado": "Copiada",
  "descarga.aviso":
    "El instalador aún no está firmado, así que Windows SmartScreen puede avisarte: pulsa «Más información» y luego «Ejecutar de todas formas». Si quieres, comprueba antes la huella.",
  "descarga.requisitos":
    "Windows 10 u 11 de 64 bits. Lleva dentro todo lo que necesita: no hay que instalar nada más.",
  "descarga.otros.t": "macOS y Linux",
  "descarga.otros.d":
    "Próximamente. La app ya compila en los tres sistemas; falta empaquetarla con calma.",
  "descarga.tuyo": "Tu sistema: {so}",

  "autor.rotulo": "Cara B · Quién la hizo",
  "autor.rol": "Desarrollador full stack y DevOps · Madrid",
  "autor.p1":
    "Toco la guitarra y la música me acompaña siempre, también mientras programo. Prensa nace de ahí: de querer mis listas en una carpeta, sin depender de nada ni de nadie.",
  "autor.p2":
    "Empezó siendo ForYouToBe, un script de Python que hacía lo justo. Con el tiempo se convirtió en esto: una app cuidada hasta el último surco que hace una sola cosa y la hace bien.",
  "autor.cita": "Me gusta que las cosas funcionen, y aún más saber por qué funcionan.",
  "autor.cuerdas": "Pasa el cursor por las cuerdas",
  "autor.cuerdas.tactil": "Toca las cuerdas",
  "autor.sonido.off": "Sonido apagado",
  "autor.sonido.on": "Sonido encendido",
  "autor.mastil": "Seis cuerdas de guitarra que vibran al pasar por encima.",
  "autor.portfolio": "Portfolio",
  "autor.github": "GitHub",
  "autor.linkedin": "LinkedIn",

  "final.titulo_html": "Tu música,<br><em>prensada</em>.",
  "final.boton": "Descargar Prensa",

  responsable:
    "Uso responsable: descarga solo contenido propio, con licencia libre o que tengas derecho a guardar. Prensa no usa cuentas ni sortea protecciones.",
  "pie.firma": "Un proyecto personal de Alonso Viñé.",
  "pie.madrid": "Hecho en Madrid, con una guitarra cerca.",
  "pie.arriba": "Volver arriba",
  "pie.fuentes": "Big Shoulders, Instrument Sans y DM Mono · OFL",
  "pie.nueva": "(se abre en otra pestaña)",
};

export type Clave = keyof typeof es;
