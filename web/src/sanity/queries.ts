import { defineQuery } from "next-sanity";

// All queries live here (TypeGen reads them: `pnpm typegen` → ./types.ts). Each projects only
// what the UI needs.
//
// Localized fields are internationalized arrays (`[{ language, value }]`, plugin v5 stores the
// language in `language`, not `_key`). `$locale` is the site locale (`es` | `en` | `uk`); an
// empty or missing row falls back to Spanish, which Studio always requires.
//
// Query names must stay unique across the repo: TypeGen keys its output by variable name.

export const SETTINGS_QUERY = defineQuery(`
  *[_type == "settings" && _id == "settings"][0]{
    phone,
    whatsapp,
    email,
    instagram,
    founder,
    areaServed,
    stats{ projects, years },
    "location": coalesce(
      location[language == $locale && length(value) > 0][0].value,
      location[language == "es" && length(value) > 0][0].value
    ),
    "address": coalesce(
      address[language == $locale && length(value) > 0][0].value,
      address[language == "es" && length(value) > 0][0].value
    )
  }
`);

export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category" && defined(key.current)] | order(orderRank, _createdAt){
    "key": key.current,
    "label": coalesce(
      label[language == $locale && length(value) > 0][0].value,
      label[language == "es" && length(value) > 0][0].value
    )
  }
`);

// No LQIP: the prototype shows a flat `--bg3` cell while a photo loads, and 41 base64 blurs
// would add ~60 KB gz to the page HTML and again to the RSC payload (D-039).
export const PORTFOLIO_QUERY = defineQuery(`
  *[_type == "portfolioItem" && defined(image.asset) && defined(category)] | order(orderRank, _createdAt){
    _id,
    "category": category->key.current,
    "caption": coalesce(
      caption[language == $locale && length(value) > 0][0].value,
      caption[language == "es" && length(value) > 0][0].value
    ),
    "alt": coalesce(
      alt[language == $locale && length(value) > 0][0].value,
      alt[language == "es" && length(value) > 0][0].value
    ),
    "image": image{
      crop{ top, bottom, left, right },
      asset->{ _id, metadata{ dimensions{ width, height } } }
    }
  }
`);

export const CLIENTS_QUERY = defineQuery(`
  *[_type == "client" && coalesce(showInWall, true)] | order(orderRank, _createdAt){
    _id,
    name,
    "tagline": coalesce(
      tagline[language == $locale && length(value) > 0][0].value,
      tagline[language == "es" && length(value) > 0][0].value
    ),
    "logo": logo{
      crop{ top, bottom, left, right },
      asset->{ _id, metadata{ dimensions{ width, height } } }
    }
  }
`);

export const TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial" && defined(client)] | order(orderRank, _createdAt){
    _id,
    "quote": coalesce(
      quote[language == $locale && length(value) > 0][0].value,
      quote[language == "es" && length(value) > 0][0].value
    ),
    "subtitle": coalesce(
      subtitle[language == $locale && length(value) > 0][0].value,
      subtitle[language == "es" && length(value) > 0][0].value
    ),
    "client": client->{
      _id,
      name,
      "tagline": coalesce(
        tagline[language == $locale && length(value) > 0][0].value,
        tagline[language == "es" && length(value) > 0][0].value
      ),
      "logo": logo{
        crop{ top, bottom, left, right },
        asset->{ _id, metadata{ dimensions{ width, height } } }
      }
    }
  }
`);

export const SERVICES_QUERY = defineQuery(`
  *[_type == "service" && defined(icon)] | order(orderRank, _createdAt){
    "key": icon,
    "name": coalesce(
      name[language == $locale && length(value) > 0][0].value,
      name[language == "es" && length(value) > 0][0].value
    ),
    "text": coalesce(
      text[language == $locale && length(value) > 0][0].value,
      text[language == "es" && length(value) > 0][0].value
    ),
    "tags": coalesce(
      tags[language == $locale && length(value) > 0][0].value,
      tags[language == "es" && length(value) > 0][0].value
    )
  }
`);
