import { defineField, defineType } from "sanity";
import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import { requiredIn } from "./validation";

// A gallery filter. Reorder it in the list (drag and drop): the site follows that order.
export const category = defineType({
  name: "category",
  title: "Categoría",
  type: "document",
  icon: () => "🏷️",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "category" }),
    defineField({
      name: "label",
      title: "Nombre del filtro",
      type: "internationalizedArrayString",
      description: "Lo que ve el visitante, p. ej. Gastronomía.",
      validation: (rule) => rule.custom(requiredIn(["es"], "Nombre")),
    }),
    defineField({
      name: "key",
      title: "Clave",
      type: "slug",
      description:
        "Identificador interno en minúsculas, sin acentos (gastronomia). No lo cambies si no hace falta.",
      options: { maxLength: 32 },
      validation: (rule) =>
        rule.required().custom((slug) => {
          const value = slug?.current;
          if (!value) return true;
          return (
            /^[a-z][a-z0-9-]*$/.test(value) ||
            "Solo minúsculas, números y guiones; sin acentos."
          );
        }),
    }),
  ],
  preview: {
    select: { label: "label", key: "key.current" },
    prepare: ({
      label,
      key,
    }: {
      label?: { language: string; value?: string }[];
      key?: string;
    }) => ({
      title:
        label?.find((item) => item.language === "es")?.value ??
        key ??
        "Sin nombre",
      subtitle: key,
    }),
  },
});
