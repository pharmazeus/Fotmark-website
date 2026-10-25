// Constants that are not content (not in Sanity, not translated).
export const BRAND = "FOTMARK";

// Browser UI colour, = --bg of the dark theme (design-system §2.3).
export const THEME_COLOR = "#0B0A08";

// Section anchors stay Spanish in every locale (D-021). Order = header nav order.
export const NAV_SECTIONS = [
  "servicios",
  "proceso",
  "sectores",
  "proyectos",
  "clientes",
  "contacto",
] as const;
