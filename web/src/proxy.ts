import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next/Vercel internals, files with an extension
  // (sitemap.xml, robots.txt) and the extensionless image routes (`/icon`, `/apple-icon`,
  // `/og`), which would otherwise be sent to the locale pages and 404.
  matcher: "/((?!api|_next|_vercel|(?:icon|apple-icon|og)(?:/|$)|.*\\..*).*)",
};
