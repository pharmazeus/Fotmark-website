import { Clientes } from "@/components/sections/Clientes";
import { Contacto } from "@/components/sections/Contacto";
import { Enfoque } from "@/components/sections/Enfoque";
import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { PorQue } from "@/components/sections/PorQue";
import { Proceso } from "@/components/sections/Proceso";
import { Proyectos } from "@/components/sections/Proyectos";
import { QueHacemos } from "@/components/sections/QueHacemos";
import { Sectores } from "@/components/sections/Sectores";
import { Servicios } from "@/components/sections/Servicios";
import { Sobre } from "@/components/sections/Sobre";
import { JsonLd } from "@/components/seo/JsonLd";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { buildStructuredData } from "@/lib/seo";
import { getServices, getSettings } from "@/sanity/fetch";

// Prototype order (design-system.md §7).
export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [meta, services, settings] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getServices(locale),
    getSettings(locale),
  ]);
  const structuredData = buildStructuredData(locale, settings, {
    description: meta("description"),
    services: services.map((service) => service.name),
  });

  return (
    <main id="contenido">
      <JsonLd data={structuredData} />
      <Hero />
      <Marquee />
      <QueHacemos />
      <Servicios />
      <Proceso />
      <Sectores />
      <PorQue />
      <Enfoque />
      <Proyectos />
      <Clientes />
      <Sobre />
      <Contacto />
    </main>
  );
}
