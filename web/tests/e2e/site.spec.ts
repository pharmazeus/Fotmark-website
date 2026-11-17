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
  await page.getByRole("button", { name: "Надіслати запит" }).click();
  await expect(page.locator("[aria-invalid='true']").first()).toBeFocused();
  await page.getByLabel("Ім’я").fill("Тестова заявка");
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
