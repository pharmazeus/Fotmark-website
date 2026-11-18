import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("starts dark, keeps theme in this tab, and preserves query/hash on locale switch", async ({
  page,
}) => {
  await page.goto("/?utm_source=test#servicios");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Cambiar al tema claro" })
    .first()
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.locator("header a[lang='en']").click();
  await expect(page).toHaveURL(/\/en\?utm_source=test#servicios$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("mobile menu traps interaction and closes with Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menú" });
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("localized utility pages, form validation and no horizontal overflow", async ({
  page,
}) => {
  await page.goto("/ua");
  await expect(page.locator("body")).toContainText("Розкажіть про свій проєкт");
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.locator("#formulario").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator("input[name='startedAt']")
        .inputValue()
        .then((token) =>
          token ? Date.now() - Number(token.split(".")[0]) : 0,
        ),
    )
    .toBeGreaterThanOrEqual(3_000);
  // The browser check stops a form with mistakes: nothing is sent or reset.
  await page.getByLabel("Ім’я").fill("Тестова заявка");
  await page.locator("#formulario label:has(input[value='dron'])").click();
  await page.getByRole("button", { name: "Надіслати запит" }).click();
  await expect(page.locator("[aria-invalid='true']").first()).toBeFocused();
  await expect(page.getByLabel("Ім’я")).toHaveValue("Тестова заявка");
  await expect(page.locator("input[value='dron']")).toBeChecked();
  await page.locator("#formulario label:has(input[value='dron'])").click();
  await page.getByLabel("Email або телефон").fill("test@example.com");
  await page.getByLabel("Тип бізнесу").fill("Готель");
  // Several services can be ticked; the checkboxes are visually hidden, so click the chips.
  for (const service of ["fotografia", "video"]) {
    await page
      .locator(`#formulario label:has(input[value='${service}'])`)
      .click();
  }
  await expect(page.locator("input[name='services']:checked")).toHaveCount(2);
  await page
    .getByLabel("Чого ви хочете досягти?")
    .fill("Потрібна професійна фотозйомка готелю.");
  await page.locator("input[name='consent']").check();
  // An address only the server rejects: React resets an action form after it answers, and
  // the values it echoes back put everything typed back in place.
  const contact = page.getByLabel("Email або телефон");
  await contact.fill("ana@-hotel.com");
  await page.getByRole("button", { name: "Надіслати запит" }).click();
  await expect(contact).toBeFocused();
  await expect(contact).toHaveAttribute("aria-invalid", "true");
  await expect(contact).toHaveValue("ana@-hotel.com");
  await expect(page.getByLabel("Ім’я")).toHaveValue("Тестова заявка");
  await expect(page.locator("input[name='services']:checked")).toHaveCount(2);
  await expect(page.getByLabel("Чого ви хочете досягти?")).toHaveValue(
    "Потрібна професійна фотозйомка готелю.",
  );
  await expect(page.locator("input[name='consent']")).toBeChecked();
  await contact.fill("test@example.com");
  await page.getByRole("button", { name: "Надіслати запит" }).click();
  await expect(page).toHaveURL(/\/ua\/gracias$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Дякуємо за звернення",
  );

  await page.goto("/ua/privacidad");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Політика конфіденційності",
  );
  await page.goto("/en/does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Page not found",
  );
});

test("favicon, touch icon and share image are served, not routed to a locale", async ({
  request,
}) => {
  for (const path of ["/icon", "/apple-icon", "/og"]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"], path).toMatch(/^image\//);
  }
});

test("homepage has no serious axe violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  expect(
    results.violations.filter((item) =>
      ["serious", "critical"].includes(item.impact ?? ""),
    ),
  ).toEqual([]);
});

test("header breakpoint, reduced motion and supported widths stay stable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [390, 820, 950, 951, 1080, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en");
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    const burger = page.getByRole("button", { name: "Menu" });
    if (width <= 950) await expect(burger).toBeVisible();
    else await expect(burger).toBeHidden();
  }
  await expect
    .poll(() =>
      page
        .locator("[data-reveal]")
        .first()
        .evaluate((node) => getComputedStyle(node).opacity),
    )
    .toBe("1");
});

test("the printed QR opens the business card: no site chrome, links, vCard, no overflow", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto("/qr");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/qr$/);
  await expect(page.locator("header nav a[href='#servicios']")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Visita nuestra web" }),
  ).toHaveAttribute("href", /^\/\?utm_source=qr&utm_medium=print/);
  const links = page.getByRole("navigation", { name: "Contacto" });
  await expect(links.locator("a[href^='tel:']")).toHaveCount(1);
  await expect(links.locator("a[href^='https://wa.me/']")).toHaveCount(1);
  await expect(links.locator("a[href^='mailto:']")).toHaveCount(1);
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  const results = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  expect(
    results.violations.filter((item) =>
      ["serious", "critical"].includes(item.impact ?? ""),
    ),
  ).toEqual([]);

  await page.locator("a[lang='uk']").click();
  await expect(page).toHaveURL(/\/ua\/qr$/);
  await expect(
    page.getByRole("link", { name: "Перейти на сайт" }),
  ).toBeVisible();

  const vcard = await request.get("/fotmark.vcf");
  expect(vcard.status()).toBe(200);
  expect(vcard.headers()["content-type"]).toMatch(/^text\/vcard/);
  expect(await vcard.text()).toMatch(/^BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
});

test("the gallery grid reveals on a phone although it is many screens tall", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.goto("/");
  const grid = page.locator("#proyectos [data-reveal]").last();
  // The observer's root is the viewport minus 8% at the bottom. A grid taller than that
  // root / 0.14 can never show 14% of itself, so the plain threshold would never fire.
  // Polls until hydration has measured the container and laid out the 2 phone columns.
  await expect
    .poll(async () => (await grid.boundingBox())?.height ?? 0)
    .toBeGreaterThan((664 * 0.92) / 0.14);
  await grid.evaluate((el) =>
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - innerHeight / 2,
      behavior: "instant",
    }),
  );
  await expect(grid).toHaveAttribute("data-in", "");
});

test("a focused form field stays visible under the header when the phone keyboard opens", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const name = page.locator("#formulario input[name='name']");
  const contact = page.locator("#formulario input[name='contact']");
  await name.scrollIntoViewIfNeeded();
  // The worst case seen on an iPhone: the field ends up hidden under the fixed header and
  // the browser does not correct it. Then the keyboard takes half of the screen.
  await name.evaluate((input) => {
    const box = (
      input.closest("[data-field]") ?? input
    ).getBoundingClientRect();
    window.scrollBy({ top: box.top - 20, behavior: "instant" });
    input.focus({ preventScroll: true });
  });
  await page.setViewportSize({ width: 390, height: 420 });
  const visible = (field: typeof name) =>
    field.evaluate((input) => {
      const header = document.getElementById("hd")?.getBoundingClientRect();
      const box = (
        input.closest("[data-field]") ?? input
      ).getBoundingClientRect();
      const bottom = window.visualViewport?.height ?? window.innerHeight;
      return (
        box.top >= (header?.bottom ?? 0) &&
        input.getBoundingClientRect().bottom <= bottom
      );
    });
  await expect.poll(() => visible(name)).toBe(true);

  // Enter moves on to the next field instead of submitting a half-filled form.
  await name.fill("Test");
  await name.press("Enter");
  await expect(contact).toBeFocused();
  await expect(page).toHaveURL(/\/en$/);
  await expect.poll(() => visible(contact)).toBe(true);
});

test("a field that is already visible is not moved when it takes focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const business = page.locator("#formulario input[name='businessType']");
  await business.evaluate((input) =>
    window.scrollBy({
      top: input.getBoundingClientRect().top - innerHeight / 2,
      behavior: "instant",
    }),
  );
  const before = await page.evaluate(() => scrollY);
  await business.evaluate((input) => input.focus({ preventScroll: true }));
  await page.waitForTimeout(800);
  expect(await page.evaluate(() => scrollY)).toBe(before);
});

test("no horizontal overflow on narrow phones in any language", async ({
  page,
}) => {
  for (const width of [320, 360, 390]) {
    await page.setViewportSize({ width, height: 740 });
    for (const path of ["/", "/en", "/ua"]) {
      await page.goto(path);
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width);
    }
  }
});

test("a form with a mistake is not sent: the typing stays and the first problem is shown", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const posts: string[] = [];
  page.on("request", (request) => {
    // The page's own token request is a POST too; only a send carries the typing.
    if (request.method() === "POST" && request.postData()?.includes("Ana"))
      posts.push(request.url());
  });
  const form = page.locator("#formulario form");
  const submit = page.getByRole("button", { name: "Enviar consulta" });
  await submit.scrollIntoViewIfNeeded();
  await expect(submit).toBeEnabled();
  await page.getByLabel("Nombre").fill("Ana");
  await page.getByLabel("Email o teléfono").fill("ana@example.com");
  await page.getByLabel("Tipo de negocio").fill("Hotel");
  await form.locator("label:has(input[value='fotografia'])").click();
  await page
    .getByLabel("¿Qué quieres conseguir?")
    .fill("Fotos nuevas para la web del hotel.");
  // Illia's case: everything filled in except the consent.
  await submit.click();
  const consent = page.locator("input[name='consent']");
  await expect(consent).toBeFocused();
  await expect(consent).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByText("Debes aceptar la política")).toBeVisible();
  await expect(page.getByLabel("Nombre")).toHaveValue("Ana");
  await expect(form.locator("input[value='fotografia']")).toBeChecked();
  expect(posts).toEqual([]);
  // The mark goes as soon as it is fixed.
  await consent.check();
  await expect(form.getByText("Debes aceptar la política")).toHaveCount(0);
});

test("ticking a service does not move the page, a focused field shows where you type", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const chip = page.locator("#formulario label:has(input[value='video'])");
  await chip.evaluate((label) =>
    window.scrollBy({
      top: label.getBoundingClientRect().top - innerHeight / 2,
      behavior: "instant",
    }),
  );
  const before = await page.evaluate(() => scrollY);
  await chip.click();
  await expect(chip.locator("input")).toBeChecked();
  await page.waitForTimeout(700);
  expect(await page.evaluate(() => scrollY)).toBe(before);

  const label = page.locator("#formulario label", { hasText: "Nombre" });
  const colour = () => label.evaluate((node) => getComputedStyle(node).color);
  const idle = await colour();
  await page.getByLabel("Nombre").focus();
  await expect.poll(colour).not.toBe(idle);

  const whatsapp = page.locator("#formulario a[href^='https://wa.me/']");
  await expect(whatsapp.locator("svg")).toHaveCount(1);
  expect(
    await whatsapp.evaluate((node) => getComputedStyle(node).borderTopWidth),
  ).toBe("1px");
});
