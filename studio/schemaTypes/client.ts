import { defineField, defineType } from "sanity";
import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";

// A client of the logo wall. Testimonials point at a client, so a client can also exist
// only for a testimonial: switch off «Mostrar en el muro».
export const client = defineType({
  name: "client",
  title: "Cliente",
  type: "document",
  icon: () => "🤝",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "client" }),
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logotipo",
      type: "image",
      description:
        "Monocromo crema sobre fondo transparente (WebP, PNG o SVG). Sin logotipo se muestra el nombre en texto.",
      options: { accept: "image/webp,image/png,image/svg+xml" },
    }),
    defineField({
      name: "tagline",
      title: "Subtítulo",
      type: "internationalizedArrayString",
      description:
        "Solo sin logotipo: texto pequeño bajo el nombre, p. ej. Artista.",
      hidden: ({ document }) =>
        Boolean((document?.logo as { asset?: unknown } | undefined)?.asset),
    }),
    defineField({
      name: "showInWall",
      title: "Mostrar en el muro de clientes",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "name", media: "logo", showInWall: "showInWall" },
    prepare: ({
      title,
      media,
      showInWall,
    }: {
      title?: string;
      media?: unknown;
      showInWall?: boolean;
    }) => ({
      title,
      subtitle: showInWall === false ? "Fuera del muro" : undefined,
      media: media as never,
    }),
  },
});
