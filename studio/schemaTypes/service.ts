import { defineField, defineType } from "sanity";
import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { requiredIn } from "./validation";

// The drawings are SVG components in the site's code, so the icon is a fixed list. It is also
// the service's key on the site (`getServices()` returns it as `key`), so each one is used once.
const ICONS = [
  { title: "Fotografía", value: "fotografia" },
  { title: "Vídeo", value: "video" },
  { title: "Dron", value: "dron" },
  { title: "Redes sociales", value: "redes" },
  { title: "Publicidad", value: "publicidad" },
  { title: "Creatividad y branding", value: "branding" },
];

// A card of the «Servicios» section. The section title and eyebrow stay in the site's
// translation files; the cards live here.
export const service = defineType({
  name: "service",
  title: "Servicio",
  type: "document",
  icon: () => "🎬",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "service" }),
    defineField({
      name: "name",
      title: "Nombre",
      type: "internationalizedArrayString",
      validation: (rule) => rule.custom(requiredIn(["es"], "Nombre")),
    }),
    defineField({
      name: "text",
      title: "Descripción",
      type: "internationalizedArrayText",
      description: "Una o dos frases.",
      validation: (rule) => rule.custom(requiredIn(["es"], "Descripción")),
    }),
    defineField({
      name: "tags",
      title: "Etiquetas",
      type: "internationalizedArrayString",
      description: "Separadas por « · », p. ej. Reels · Eventos · Entrevistas.",
      validation: (rule) => rule.custom(requiredIn(["es"], "Etiquetas")),
    }),
    defineField({
      name: "icon",
      title: "Icono",
      type: "string",
      description: "El dibujo de la tarjeta. Cada icono se usa una sola vez.",
      options: { list: ICONS, layout: "dropdown" },
      validation: (rule) => [
        rule.required(),
        rule.custom(async (value, context) => {
          if (!value) return true;
          const id = context.document?._id?.replace(/^drafts\./, "");
          const duplicates = await context
            .getClient({ apiVersion: "2026-10-01" })
            .fetch<number>(
              `count(*[_type == "service" && icon == $icon && !(_id in [$id, "drafts." + $id])])`,
              { icon: value, id },
            );
          return duplicates === 0 || "Ya hay un servicio con este icono.";
        }),
      ],
    }),
  ],
  preview: {
    select: { name: "name", icon: "icon" },
    prepare: ({
      name,
      icon,
    }: {
      name?: { language: string; value?: string }[];
      icon?: string;
    }) => ({
      title:
        name?.find((item) => item.language === "es")?.value ?? "Sin nombre",
      subtitle: ICONS.find((item) => item.value === icon)?.title,
    }),
  },
});
