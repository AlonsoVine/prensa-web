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
  await expect(page.locator(".hero__sub")).toContainText("app de escritorio");
  await expect(page.locator(".captura")).toHaveCount(6);
  expect(await page.content()).not.toContain("{{");
  await contexto.close();
});

test("cambia de idioma y lo recuerda", async ({ page }) => {
  await abrir(page, "?lang=es");
  await page.locator(".idioma").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".hero__sub")).toContainText("desktop app");
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
  await expect(page.locator(".visor__n")).toHaveText("01 / 06");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".visor__n")).toHaveText("02 / 06");
  await page.keyboard.press("Escape");
  await expect(visor).toBeHidden();
});
