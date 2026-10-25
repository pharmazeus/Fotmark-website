import Script from "next/script";
import { THEME_COLOR, THEME_COLOR_LIGHT } from "@/lib/site";

const themeScript = `
(() => {
  try {
    const theme = sessionStorage.getItem("fotmark-theme") === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "${THEME_COLOR_LIGHT}" : "${THEME_COLOR}");
  } catch {}
})();`;

export function ThemeScript() {
  return (
    // This locale layout is the app's root layout; the script must run before hydration.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="fotmark-theme" strategy="beforeInteractive">
      {themeScript}
    </Script>
  );
}
