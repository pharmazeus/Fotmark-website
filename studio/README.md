# FOTMARK Studio

Sanity Studio for the FOTMARK website: portfolio photos, categories, clients, testimonials, services and site settings, each field in Spanish, English and Ukrainian.

Deployed at https://fotmark.sanity.studio (project `s8t1xmk2`, dataset `production`).

```bash
pnpm studio                                   # from the repo root → http://localhost:3333
pnpm typegen                                  # after any schema or query change
pnpm --filter studio deploy                   # publish the Studio
```

`scripts/` holds the one-off photo matcher and seed (`sanity exec … --with-user-token`, always `--dry-run` first) and a CDN check that uploaded images carry no EXIF/GPS. Their inputs live outside the repository.
