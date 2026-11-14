#!/usr/bin/env bash
# Prepara el material de una ronda de revisión: compila, fotografía la web
# compilada (vite preview en :4173) en varios tamaños/idiomas y monta hojas de contactos.
# Uso: bash scripts/revision.sh <n>
set -euo pipefail
n="$1"
dir=".revision/ronda$n"
rm -rf "$dir" && mkdir -p "$dir"
export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-C:/proyectos/prensa/prensa-app/.herramientas/navegadores}"
npx vite build >/dev/null
url="http://localhost:4173/"
node scripts/fotos.mjs "$url" "$dir" 1920 lang=es >/dev/null
node scripts/fotos.mjs "$url" "$dir" 1280 lang=en >/dev/null
node scripts/fotos.mjs "$url" "$dir" 390 lang=es >/dev/null
node scripts/fotos.mjs "$url" "$dir" 1440 "lang=es&mov=reducido" >/dev/null
node scripts/contactos.mjs "$dir" 1920 "$dir/hoja-1920.png" 4 600 >/dev/null
node scripts/contactos.mjs "$dir" 1280 "$dir/hoja-1280-en.png" 4 600 >/dev/null
node scripts/contactos.mjs "$dir" 390 "$dir/hoja-390.png" 8 300 >/dev/null
node scripts/contactos.mjs "$dir" 1440 "$dir/hoja-1440-reducido.png" 4 600 >/dev/null
echo "$dir"
