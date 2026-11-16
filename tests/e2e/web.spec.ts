import { expect, test, type Page } from "@playwright/test";

async function abrir(page: Page, query = ""): Promise<string[]> {
  const errores: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errores.push(m.text());
  });
  page.on("pageerror", (e) => errores.push(String(e)));
  await page.goto(`./${query}`);
  await page.waitForTimeout(4000);
  return errores;
}

test("carga sin errores ni desbordes y recorre la página entera", async ({ page }) => {
  const errores = await abrir(page, "?lang=es");
  const alto = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < alto; y += 700) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(500);
  // En móvil, un desbordamiento ensancha el viewport de diseño: innerWidth crece
  // junto con scrollWidth, así que se compara con el ancho real de la ventana.
  const real = page.viewportSize()?.width ?? 0;
  const medidas = await page.evaluate(() => ({
    interior: innerWidth,
    contenido: document.documentElement.scrollWidth,
  }));
  expect(medidas.interior).toBe(real);
  expect(medidas.contenido).toBeLessThanOrEqual(real);
  expect(errores).toEqual([]);
});

test("el HTML llega completo y en español sin JavaScript", async ({ browser }) => {
  const contexto = await browser.newContext({ javaScriptEnabled: false });
  const page = await contexto.newPage();
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator(".hero__sub")).toContainText("tu ordenador y tu Android");
  await expect(page.locator(".captura")).toHaveCount(8);
  expect(await page.content()).not.toContain("{{");
  await contexto.close();
});

test("cambia de idioma y lo recuerda", async ({ page }) => {
  await abrir(page, "?lang=es");
  await page.locator(".idioma").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".hero__sub")).toContainText("your computer and your Android");
  await expect(page).toHaveTitle(/pressed into MP3/);
  await page.goto("./");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("el instalador se sirve y su huella coincide con la publicada", async ({ page, request }) => {
  await abrir(page, "?lang=es");
  const enlace = page.locator(".descarga [data-descarga]");
  const href = await enlace.getAttribute("href");
  expect(href).toMatch(/descargas\/Prensa_.*-setup\.exe$/);
  const respuesta = await request.head(href ?? "");
  expect(respuesta.ok()).toBe(true);
  const sha = (await page.locator(".sha__valor").textContent())?.trim();
  expect(sha).toMatch(/^[0-9a-f]{64}$/);
});

test("con movimiento reducido todo el contenido está visible desde el principio", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await abrir(page, "?lang=es");
  await expect(page.locator(".precarga")).toBeHidden();
  await expect(page.locator(".hero__titulo")).toBeVisible();
  const paso = page.locator(".paso").nth(2);
  await paso.scrollIntoViewIfNeeded();
  await expect(paso.locator(".paso__d")).toBeVisible();
  const opacidad = await page
    .locator(".principio")
    .first()
    .evaluate((el) => getComputedStyle(el).opacity);
  expect(opacidad).toBe("1");
});

test("el visor de capturas se abre, navega y se cierra con teclado", async ({ page }) => {
  await abrir(page, "?lang=es");
  const marco = page.locator(".captura__marco").first();
  await marco.scrollIntoViewIfNeeded();
  await marco.click();
  const visor = page.locator(".visor");
  await expect(visor).toBeVisible();
  await expect(page.locator(".visor__n")).toHaveText("01 / 08");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".visor__n")).toHaveText("02 / 08");
  await page.keyboard.press("Escape");
  await expect(visor).toBeHidden();
});

test("la carpeta que crece: la escena acaba con todo prensado y la lista al día", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await abrir(page, "?lang=es");
  const mesa = page.locator(".mesa");
  await mesa.scrollIntoViewIfNeeded();
  await expect(mesa.locator(".mesa__cuenta")).toHaveText("13 vídeos");
  await expect(mesa.locator(".mesa__tengo")).toHaveText("13 de 13");
  await expect(mesa.locator(".fichero--nuevo.hecho")).toHaveCount(3);
  await expect(mesa.locator(".fichero--m3u")).toHaveClass(/hecho/);
  await expect(page.locator(".coleccion .paso__d").nth(2)).toBeVisible();
});

test.describe("en un Android", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36",
  });
  test("ofrece el APK", async ({ page, request }) => {
    await abrir(page, "?lang=es");
    const enlace = page.locator(".descarga [data-descarga]");
    await expect(enlace).toContainText("Android");
    const href = await enlace.getAttribute("href");
    expect(href).toMatch(/descargas\/Prensa_.*\.apk$/);
    expect((await request.head(href ?? "")).ok()).toBe(true);
  });
});

test.describe("en un iPhone", () => {
  test.use({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  });
  test("explica por qué no hay versión y no ofrece un instalador", async ({ page }) => {
    await abrir(page, "?lang=es");
    await expect(page.locator(".descarga__tuyo")).toContainText("En iPhone y iPad no existe");
    // El botón principal no descarga: ofrece enviarse el enlace al ordenador.
    await expect(page.locator(".descarga [data-descarga]")).toContainText("Enviarme el enlace");
  });
});
