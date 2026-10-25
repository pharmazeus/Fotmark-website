import { defineField, defineType } from "sanity";
import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { requiredIn } from "./validation";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonio",
  type: "document",
  icon: () => "💬",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "testimonial" }),
    defineField({
      name: "quote",
      title: "Cita",
      type: "internationalizedArrayText",
      description: "Sin comillas. En español obligatorio.",
      validation: (rule) => rule.custom(requiredIn(["es"], "Cita")),
    }),
    defineField({
      name: "client",
      title: "Cliente",
      type: "reference",
      to: [{ type: "client" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Tipo de negocio · lugar",
      type: "internationalizedArrayString",
      description: "P. ej. Restaurante · Torremolinos.",
      validation: (rule) => rule.custom(requiredIn(["es"], "Subtítulo")),
    }),
  ],
  preview: {
    select: { client: "client.name", quote: "quote" },
    prepare: ({
      client,
      quote,
    }: {
      client?: string;
      quote?: { language: string; value?: string }[];
    }) => ({
      title: client ?? "Sin cliente",
      subtitle: quote?.find((item) => item.language === "es")?.value,
    }),
  },
});
