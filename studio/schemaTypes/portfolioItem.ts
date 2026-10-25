import { defineField, defineType } from "sanity";
import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { ALL_LANGUAGE_IDS, imageLongSide, requiredIn } from "./validation";

// Recommended minimum long side for a gallery photo (the lightbox shows it large; D-012).
const MIN_LONG_SIDE = 1600;

// One gallery photo. The list order is the gallery order; the site reads the photo's
// width/height from the asset, so there is no ratio field to keep.
export const portfolioItem = defineType({
  name: "portfolioItem",
  title: "Foto del portfolio",
  type: "document",
  icon: () => "📷",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "portfolioItem" }),
    defineField({
      name: "image",
      title: "Foto",
      type: "image",
      description: `Lado largo recomendado: ${MIN_LONG_SIDE} px o más. Marca el punto focal (hotspot) si hace falta.`,
      options: { hotspot: true },
      validation: (rule) => [
        rule.required(),
        // A warning, not an error: a smaller photo (the five 1537 px PNGs from the owner) can
        // still be published, the editor is only told.
        rule
          .custom((image) => {
            const ref = (image as { asset?: { _ref?: string } } | undefined)
              ?.asset?._ref;
            const longSide = imageLongSide(ref);
            if (longSide === undefined || longSide >= MIN_LONG_SIDE)
              return true;
            return `La foto es pequeña (${longSide} px). Se recomienda un lado largo de ${MIN_LONG_SIDE} px o más.`;
          })
          .warning(),
      ],
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Pie de foto",
      type: "internationalizedArrayString",
      description: "Texto corto bajo la foto (en español obligatorio).",
      validation: (rule) => rule.custom(requiredIn(["es"], "Pie de foto")),
    }),
    defineField({
      name: "alt",
      title: "Texto alternativo (alt)",
      type: "internationalizedArrayString",
      description:
        "Describe la foto para lectores de pantalla y buscadores. Obligatorio en ES, EN y UK.",
      validation: (rule) => rule.custom(requiredIn(ALL_LANGUAGE_IDS, "Alt")),
    }),
  ],
  preview: {
    select: {
      caption: "caption",
      category: "category.label",
      media: "image",
    },
    prepare: ({
      caption,
      category,
      media,
    }: {
      caption?: { language: string; value?: string }[];
      category?: { language: string; value?: string }[];
      media?: unknown;
    }) => ({
      title:
        caption?.find((item) => item.language === "es")?.value ??
        "Sin pie de foto",
      subtitle: category?.find((item) => item.language === "es")?.value,
      media: media as never,
    }),
  },
});
