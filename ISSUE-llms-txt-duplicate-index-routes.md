# Bug: llms.txt lists every page twice, once under a non-existent `/.../index` URL that returns 404

### Module version

nuxt-ai-ready 1.4.0

### Environment

- Nuxt 4.4.8
- Prerendered pages (`nitro.prerender.crawlLinks: true`)
- `site.trailingSlash: true` (required to trigger the bug)

### Reproduction

This repository. Add `robots: {}` to `nuxt.config.ts` first (separate bug, see ISSUE-robots-undefined-crash.md), then:

```sh
npm install
npm run generate
cat .output/public/llms.txt
```

### Expected behavior

Each page appears once, under its canonical URL:

```
- [Home](/)
- [About](/about)
```

### Actual behavior

Pages appear up to three times, including a trailing `index` variant that does not exist as a route and returns 404 when fetched (verified output of this repro):

```
- /
- /about
- /about/
- /about/index
```

### Root cause

In `dist/module.mjs` (1.4.0), the `prerender:generate` handler normalizes only the bare root:

```js
if (pageRoute === "/index") pageRoute = "/";
```

Nested prerender outputs like `/about/index` keep their `index` suffix and get inserted into the page database as separate entries next to `/about`, so the llms.txt builder emits both.

### Suggested fix

Normalize the suffix for every route, mirroring the error-route normalization already present in the same file:

```js
pageRoute = pageRoute.replace(/\/index$/, "") || "/";
```

### Possibly related

Issue #14 ("prerendering throws 404 on nested index.md routes") looks adjacent: the same un-normalized `/index` route variants would also produce the 404ing nested `index.md` markdown routes.

### Additional observation (cache staleness)

The page database persisted under `node_modules/.cache/nuxt-seo/ai-ready/routes` is keyed by content hash only. When `NUXT_SITE_URL` changes between builds (for example preview vs production), previously cached entries keep their old absolute origin and page set, so llms.txt is generated with the previous environment's URLs until the cache directory is deleted manually. Including the site origin in the cache key (or invalidating on origin change) would avoid baking preview URLs into production output on build machines with persistent caches.
