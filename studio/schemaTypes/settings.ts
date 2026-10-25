import { defineArrayMember, defineField, defineType } from "sanity";
import { requiredIn } from "./validation";

// Singleton (id `settings`, registered in sanity.config.ts): contacts, stats and default SEO.
export const settings = defineType({
  name: "settings",
  title: "Ajustes del sitio",
  type: "document",
  icon: () => "⚙️",
  groups: [
    { name: "contact", title: "Contacto", default: true },
    { name: "stats", title: "Cifras" },
  ],
  fields: [
    defineField({
      name: "phone",
      title: "Teléfono",
      type: "string",
      group: "contact",
      description: "Con prefijo, p. ej. +34 672 463 000",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "whatsapp",
      title: "WhatsApp",
      type: "string",
      group: "contact",
      description: "Con prefijo, p. ej. +34 672 463 000",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "contact",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "instagram",
      title: "Instagram",
      type: "string",
      group: "contact",
      description: "Con @, p. ej. @fotmark.es",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "founder",
      title: "Fundador",
      type: "string",
      group: "contact",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "location",
      title: "Zona de trabajo",
      type: "internationalizedArrayString",
      group: "contact",
      description: "Una línea corta, p. ej. Málaga · Costa del Sol",
      validation: (rule) => rule.custom(requiredIn(["es"], "Zona de trabajo")),
    }),
    defineField({
      name: "address",
      title: "Dirección (pie de página)",
      type: "internationalizedArrayText",
      group: "contact",
      description: "Columna «Ubicación». Una línea por fila.",
      validation: (rule) => rule.custom(requiredIn(["es"], "Dirección")),
    }),
    defineField({
      name: "areaServed",
      title: "Zona de servicio",
      type: "array",
      group: "contact",
      of: [defineArrayMember({ type: "string" })],
      description:
        "Municipios donde trabajas, uno por fila y en este orden (sin traducir: son nombres propios).",
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "stats",
      title: "Cifras",
      type: "object",
      group: "stats",
      options: { columns: 2 },
      fields: [
        defineField({
          name: "projects",
          title: "Proyectos",
          type: "string",
          description: "Tal como se muestra, p. ej. 40+",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "years",
          title: "Años de experiencia",
          type: "number",
          validation: (rule) => rule.required().integer().min(0),
        }),
      ],
    }),
    defineField({
      name: "seo",
      title: "SEO por defecto",
      type: "object",
      // Hidden until the site reads it (roadmap: wire settings.seo into metadata).
      hidden: true,
      fields: [
        defineField({
          name: "title",
          title: "Título",
          type: "internationalizedArrayString",
          description: "Hasta ~60 caracteres.",
        }),
        defineField({
          name: "description",
          title: "Descripción",
          type: "internationalizedArrayText",
          description: "Hasta ~160 caracteres.",
        }),
        defineField({
          name: "ogImage",
          title: "Imagen para compartir (OG)",
          type: "image",
          description: "1200 × 630 px.",
          options: { hotspot: true },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Ajustes del sitio" }),
  },
});
