import { getTranslations } from "next-intl/server";
import { buildVCard, cardRegion } from "@/features/card/vcard";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";
import { BRAND } from "@/lib/site";
import { getSettings } from "@/sanity/fetch";

// "Save contact" on the `/qr` business card. Contacts come from Sanity `settings`, so the
// card follows Studio edits through the same `settings` tag as the pages. The file name has
// an extension, so the proxy (next-intl) leaves this route alone.
export const dynamic = "force-static";

export async function GET() {
  const locale = routing.defaultLocale;
  const [settings, hero] = await Promise.all([
    getSettings(locale),
    getTranslations({ locale, namespace: "hero" }),
  ]);

  const body = buildVCard({
    ...settings,
    name: BRAND,
    note: [hero("descriptor"), cardRegion(settings.location)]
      .filter(Boolean)
      .join(" · "),
    website: absoluteUrl("/"),
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      // inline: iOS Safari opens the contact preview with "Create New Contact"; Android
      // downloads it and offers Contacts.
      "Content-Disposition": 'inline; filename="fotmark.vcf"',
    },
  });
}
