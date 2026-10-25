import { getTranslations } from "next-intl/server";

export async function SkipLink() {
  const t = await getTranslations("a11y");

  return (
    <a
      href="#contenido"
      className="fixed top-3 left-3 z-3000 -translate-y-[200%] bg-bg1 px-4 py-2 text-nav text-ink uppercase focus-visible:translate-y-0"
    >
      {t("skipToContent")}
    </a>
  );
}
