import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { StructureResolver } from "sanity/structure";

// Types shown as drag-and-drop lists (they carry an `orderRank` field) and the singleton.
const ORDERED = [
  { type: "portfolioItem", title: "Fotos del portfolio", icon: () => "📷" },
  { type: "category", title: "Categorías", icon: () => "🏷️" },
  { type: "client", title: "Clientes", icon: () => "🤝" },
  { type: "testimonial", title: "Testimonios", icon: () => "💬" },
  { type: "service", title: "Servicios", icon: () => "🎬" },
];
const SINGLETON_TYPES = ["settings"];

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Contenido")
    .items([
      // The id and the schema type come from `document.singletons` in sanity.config.ts.
      S.listItem().singleton("settings"),
      S.divider(),
      ...ORDERED.map((item) =>
        orderableDocumentListDeskItem({ ...item, S, context }),
      ),
      // Anything else (none today) still shows up instead of silently disappearing.
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return (
          id &&
          !SINGLETON_TYPES.includes(id) &&
          !ORDERED.some((o) => o.type === id)
        );
      }),
    ]);
