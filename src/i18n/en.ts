import type { Clave } from "./es";

export const en: Record<Clave, string> = {
  "meta.title": "Prensa: your YouTube playlists, pressed into MP3",
  "meta.og.title": "Prensa · Your YouTube playlists, pressed into MP3",
  "meta.og.desc":
    "Paste a YouTube playlist and get it back as MP3s with title, artist and cover art. Free, local, no accounts. For Windows, macOS and Linux.",
  "meta.og.alt":
    "Prensa: a black vinyl record with a red label being pressed, next to the headline “Your YouTube playlists, pressed into MP3”.",
  "meta.desc":
    "Prensa is a free desktop app that turns a public YouTube playlist into a folder of MP3s with title, artist and cover art. Local, no accounts, no telemetry.",

  saltar: "Skip to content",
  "nav.como": "How it works",
  "nav.capturas": "Screenshots",
  "nav.ficha": "Specs",
  "nav.autor": "Maker",
  "nav.descargar": "Download",
  "nav.idioma": "Switch to Spanish",
  "cinta.pausa": "Pause the scrolling ticker",
  "manifiesto.h2": "What Prensa is",
  "nav.principal": "Main",

  "precarga.texto": "Pressing master",

  "hero.rotulo": "Side A · 33 1/3 rpm · Edition",
  "hero.lema_html": "Your YouTube playlists, <em>pressed</em> into&nbsp;MP3.",
  "hero.sub":
    "A desktop app that turns a public playlist into a folder of songs with title, artist and cover art. Everything happens on your computer.",
  "hero.cta": "Download for Windows",
  "hero.cta2": "How it works",
  "hero.gratis": "Free",
  "hero.aguja": "Drop the needle",
  "hero.disco": "A vinyl record with Prensa's red label, spinning.",

  "hero.dato.lado": "Side",
  "hero.dato.cat": "Cat.",

  "porque.rotulo": "The obvious question",
  "porque.titulo_html": "Why an app<br>and not a website?",
  "porque.intro":
    "Video-converter websites work backwards: your music travels to someone else's server, gets processed there and comes back loose, with limits and waiting. Prensa brings the machine to your desk.",
  "porque.col.web": "Converter website",
  "porque.col.app": "Prensa",
  "porque.1.k": "Where it happens",
  "porque.1.web": "On a server you don't know",
  "porque.1.app": "On your computer, start to finish",
  "porque.2.k": "How much",
  "porque.2.web": "Song by song, with limits",
  "porque.2.app": "Whole playlists, even with thousands of tracks",
  "porque.3.k": "What you get",
  "porque.3.web": "A loose file with no tags",
  "porque.3.app": "A tidy folder, with tags and cover art",
  "porque.4.k": "In exchange for",
  "porque.4.web": "Ads, redirects and trackers, often",
  "porque.4.app": "Nothing. There's no server to put them there",
  "porque.5.k": "If it stops",
  "porque.5.web": "Start over",
  "porque.5.app": "Resumes where it left off and tells you what failed",
  "porque.6.k": "When YouTube changes",
  "porque.6.web": "Wait for someone to fix it",
  "porque.6.app": "The engine updates itself",

  "cinta.1": "No accounts",
  "cinta.2": "No cookies",
  "cinta.3": "No telemetry",
  "cinta.4": "MP3 VBR or 320 kbps",
  "cinta.5": "Embedded cover art",
  "cinta.6": "Album and track number",
  "cinta.7": "Resumable",
  "cinta.8": "Self-updating engine",

  "manifiesto.rotulo": "Side A · The manifesto",
  "manifiesto.texto":
    "Paste a link, review the tracks and pick a folder. Prensa does the rest: every song comes out as a clean MP3, with its name, its artist and its cover. No accounts, no cookies, and nothing leaves your computer.",
  "principio.1.t": "Local",
  "principio.1.d":
    "No server, no analytics. It only talks to YouTube, to read the playlist, and to GitHub, to update the engine.",
  "principio.2.t": "No accounts",
  "principio.2.d":
    "It never asks for, reads or stores credentials or cookies. Works with public or unlisted playlists.",
  "principio.3.t": "Resumable",
  "principio.3.d":
    "Stop halfway and what's already pressed won't repeat. Whatever fails tells you why, and you can retry just that.",

  "como.rotulo": "How it works",
  "como.titulo_html": "Three steps.<br>One press.",
  "paso.1.t": "Paste",
  "paso.1.d":
    "Copy the link to a public YouTube or YouTube Music playlist. Prensa validates it instantly and rejects account-bound lists before calling anyone.",
  "paso.2.t": "Review",
  "paso.2.d":
    "The tracks appear with their length and thumbnail. Tick the ones you want, pick a folder and see which videos are unavailable before you start.",
  "paso.3.t": "Press",
  "paso.3.d":
    "Each track is downloaded and converted to MP3 with title, artist, album, number and cover. The record fills with grooves and, at the end, the stamp.",
  "escena.miga.1": "Link",
  "escena.miga.2": "Tracks",
  "escena.miga.3": "Download",
  "escena.boton": "Read list",
  "escena.cola": "Queued",
  "escena.bajando": "Pressing",
  "escena.hecha": "Saved",
  "escena.sello": "Pressed",
  "escena.pistas": "5 tracks · 21 min",
  "escena.lista": "Field recordings",

  "capturas.rotulo": "The app, as is",
  "capturas.titulo_html": "Real screenshots,<br>no retouching.",
  "capturas.sub": "Every image comes from the app's automated tests. What you see is what you get.",
  "capturas.ampliar": "Enlarge",
  "capturas.cerrar": "Close",
  "capturas.anterior": "Previous",
  "capturas.siguiente": "Next",
  "capturas.arrastra": "Swipe",
  "cap.inicio.t": "Paste a playlist",
  "cap.inicio.d": "The front page: one field, one button and the master waiting.",
  "cap.lista.t": "Review the tracks",
  "cap.lista.d": "Range selection, lengths and warnings before you start.",
  "cap.descargando.t": "Pressing",
  "cap.descargando.d":
    "Two tracks at once. The VU meter shows the speed; the record, the progress.",
  "cap.completado.t": "Pressed",
  "cap.completado.d": "Everything in your folder, with the stamp and a button to open it.",
  "cap.parcial.t": "Almost all",
  "cap.parcial.d": "Whatever couldn't be saved is listed on top, with its reason.",
  "cap.lista-claro.t": "In daylight",
  "cap.lista-claro.d": "Light theme: the order sheet on the desk.",
  "cap.bloqueo.t": "Honest errors",
  "cap.bloqueo.d": "If YouTube blocks the connection, Prensa stops and tells you why.",
  "cap.ajustes.t": "Settings",
  "cap.ajustes.d": "V0 or 320 kbps quality, theme, language and thumbnails.",

  "ficha.rotulo": "Back cover",
  "ficha.titulo": "The spec sheet",
  "ficha.formato.k": "Format",
  "ficha.formato.v": "MP3 · top VBR or 320 kbps",
  "ficha.etiquetas.k": "Tags",
  "ficha.etiquetas.v": "Title, artist, album, track number and cover art",
  "ficha.carpeta.k": "Folder",
  "ficha.carpeta.v": "‹folder›/‹playlist›/‹no.› - ‹title›.mp3",
  "ficha.fuentes.k": "Accepts",
  "ficha.fuentes.v": "youtube.com · music.youtube.com · youtu.be",
  "ficha.motor.k": "Engine",
  "ficha.motor.v": "yt-dlp and ffmpeg bundled, verified by SHA-256",
  "ficha.update.k": "Up to date",
  "ficha.update.v": "yt-dlp updates itself from GitHub",
  "ficha.idiomas.k": "Interface",
  "ficha.idiomas.v": "Spanish and English · light and dark theme",
  "ficha.privacidad.k": "Privacy",
  "ficha.privacidad.v": "No accounts, cookies, server or telemetry",
  "ficha.hecho.k": "Built with",
  "ficha.hecho.v": "Tauri 2 · Rust · React · TypeScript",

  "descarga.rotulo": "Take it home",
  "descarga.titulo_html": "Drop the needle<br>on your machine.",
  "descarga.boton": "Download for Windows",
  "descarga.detalle": "Installer · x64 · {mb} MB · v{version}",
  "descarga.sha": "SHA-256 fingerprint",
  "descarga.copiar": "Copy",
  "descarga.copiado": "Copied",
  "descarga.seleccionada": "Couldn't copy: the fingerprint is selected so you can copy it by hand.",
  "descarga.aviso":
    "The installer isn't signed yet, so Windows SmartScreen may warn you: click “More info” and then “Run anyway”. Check the fingerprint first if you like.",
  "descarga.requisitos":
    "64-bit Windows 10 or 11. Everything it needs is inside: nothing else to install.",
  "descarga.otros.t": "All downloads",
  "descarga.otros.d":
    "None are signed yet. Each file has its SHA-256 fingerprint (click it to copy the full one).",
  "descarga.boton.macos": "Download for macOS",
  "descarga.boton.linux": "Download for Linux",
  "descarga.detalle.macos": "Disk image · Apple Silicon · {mb} MB · v{version}",
  "descarga.detalle.linux": "AppImage · x64 · {mb} MB · v{version}",
  "descarga.aviso.macos":
    "It isn't signed by Apple yet, so macOS will say it can't verify it. Drag it to Applications, right-click it and choose “Open”; on macOS 15, go to Settings › Privacy & Security and click “Open Anyway”.",
  "descarga.aviso.linux":
    "Make it executable (chmod +x Prensa_*.AppImage) and open it. On Debian or Ubuntu you can also install the .deb package from the list.",
  "descarga.requisitos.macos":
    "macOS 11 or later on an Apple Silicon Mac (M1 or newer). Everything it needs is inside.",
  "descarga.requisitos.linux":
    "64-bit Linux. The AppImage runs on most distributions; the .deb, on Debian and Ubuntu 22.04 or later.",
  "descarga.movil":
    "Prensa is a desktop app: it doesn't run on phones. Send yourself the link and download it on your computer.",
  "descarga.movil.cta": "Get it on your computer",
  "descarga.compartir": "Send me the link",
  "descarga.enlace.copiado": "Link copied",
  "descarga.tuyo": "Your system: {so}",

  "autor.rotulo": "Side B · Who made it",
  "autor.rol": "Full stack & DevOps developer · Madrid",
  "autor.p1":
    "I play guitar and music is always with me, coding included. Prensa comes from there: wanting my playlists in a folder, without depending on anything or anyone.",
  "autor.p2":
    "It started as ForYouToBe, a Python script that did the bare minimum. Over time it became this: an app crafted down to the last groove, that does one thing and does it well.",
  "autor.cita": "I like things to work, and even more, to know why they work.",
  "autor.cuerdas": "Run your cursor across the strings · every fret is a capo",
  "autor.cejilla": "Capo on fret {n}",
  "autor.alAire": "Open strings",
  "autor.cuerdas.tactil": "Tap the strings",
  "autor.sonido.off": "Sound off",
  "autor.sonido.on": "Sound on",
  "autor.mastil":
    "Six guitar strings. With focus here, keys 1 to 6 pluck each string, Enter strums them all and the arrow keys move the capo fret by fret.",
  "autor.portfolio": "Portfolio",
  "autor.github": "GitHub",
  "autor.linkedin": "LinkedIn",

  "final.titulo_html": "Your music,<br><em>pressed</em>.",
  "final.boton": "Download Prensa",

  responsable:
    "Responsible use: only download content you own, that has a free licence or that you have the right to keep. Prensa uses no accounts and bypasses no protections.",
  "pie.firma": "A personal project by Alonso Viñé.",
  "pie.madrid": "Made in Madrid, with a guitar nearby.",
  "pie.arriba": "Back to top",
  "pie.fuentes": "Big Shoulders, Instrument Sans & DM Mono · OFL",
  "pie.nueva": "(opens in a new tab)",
  "legal.priv.titulo": "Privacy",
  "legal.priv.texto_html":
    '<p><strong>Controller:</strong> Alonso Viñé, as an individual. Prensa is a non-profit personal project. Contact: <a href="https://github.com/AlonsoVine/prensa-web/issues" target="_blank" rel="noopener">issues on the GitHub repository</a>.</p><p><strong>This website</strong> uses no cookies, analytics, ads or third-party services; fonts are served from the site itself. It only keeps two values in your browser, never sent anywhere: your chosen language (<code>localStorage</code>) and whether you have seen the loading animation (<code>sessionStorage</code>). You can clear them from your browser at any time.</p><p><strong>Hosting:</strong> the site is served by GitHub Pages, which logs your IP address for security under its <a href="https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener">privacy statement</a>. Downloads come from GitHub Releases.</p><p><strong>The app</strong> has no accounts, no server of its own and no telemetry: it does not collect or send any of your data. Your settings are stored only on your computer. To work, it connects from your computer to YouTube (the playlists you paste), i.ytimg.com (thumbnails, can be turned off) and GitHub (yt-dlp updates); those services see your IP and handle it under their own policies.</p><p><strong>Your rights:</strong> since no personal data is processed, there is nothing for me to access or erase. You can still get in touch through the contact channel or complain to the <a href="https://www.aepd.es/" target="_blank" rel="noopener">Spanish Data Protection Agency (AEPD)</a>.</p>',
  "legal.aviso.titulo": "Legal notice",
  "legal.aviso.texto_html":
    '<p>Prensa is free software, made by one person as a personal project, with no ads or income of any kind.</p><p><strong>Not affiliated with YouTube.</strong> Prensa is not affiliated with, sponsored or endorsed by YouTube or Google LLC. “YouTube” is a trademark of Google LLC and is named here only to describe which playlists it works with.</p><p><strong>Responsible use.</strong> Prensa is meant for your music: your own, music released under a free licence (e.g. Creative Commons) or music you hold the rights to. You are responsible for what you download and for respecting copyright and each service’s terms. The app does not download private or paid content.</p><p><strong>No warranty.</strong> The software is provided “as is”, without warranty of any kind; the author is not liable for damages or misuse.</p><p><strong>Rights holders.</strong> If you believe this site or the app infringes your rights, write via <a href="https://github.com/AlonsoVine/prensa-web/issues" target="_blank" rel="noopener">GitHub issues</a> and I will review it promptly.</p>',
};
