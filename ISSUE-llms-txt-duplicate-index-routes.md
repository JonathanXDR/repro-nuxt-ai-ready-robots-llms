# llms.txt lists every nested page under a non-existent /.../index URL

## The bug

With `site.trailingSlash: true` and prerendered pages, `llms.txt` lists each nested page several times, including a trailing `index` variant that is not a real route. For a site with just `/` and `/about`, the generated `.output/public/llms.txt` contains:

```
## Pages

- /

- /about
- /about/
- /about/index
```

`/about/index` is not a navigable route. Only `/about/` exists (its `index.html` is the directory index). `llms-full.txt` is affected the same way, emitting a `### /about/index` section sourced from `https://example.com/about/index`.

The root route is normalized correctly (`/index` becomes `/`), but nested routes keep their `index` suffix.

## To reproduce

https://stackblitz.com/github/JonathanXDR/repro-nuxt-ai-ready-robots-llms

## Expected behavior

Each page should appear once under its canonical URL, with the `/index` suffix stripped for nested routes just like it is for the root:

```
## Pages

- /
- /about
```

## Additional context

Root cause in `node_modules/nuxt-ai-ready/dist/module.mjs` (1.4.0). The `prerender:generate` handler normalizes only the bare root:

```js
// line 294
let pageRoute = route.route.replace(RE_MD_EXT, "");
if (pageRoute === "/index")   // line 295
  pageRoute = "/";            // line 296
```

Nested prerender outputs like `/about/index` keep their `index` suffix and get inserted into the page database as separate entries next to `/about`, so the llms.txt builder emits both. The error-route branch in the same handler already does the correct normalization (line 287 uses `RE_INDEX_SUFFIX` `/\/index$/`), so applying the same regex here fixes it:

```js
let pageRoute = route.route.replace(RE_MD_EXT, "").replace(/\/index$/, "") || "/";
```

Reproduce caveat: the bug is observed in the build output of `nuxt generate`. The build-time page-database writer (`initCrawler`, module.mjs line 87) imports `better-sqlite3`, a native addon that does not load in WebContainer. So the live StackBlitz instead reproduces the companion module-setup crash (see ISSUE-robots-undefined-crash.md) which happens earlier and is native-free. To see this llms.txt bug, run the repro on a normal machine: add `robots: {}` to `nuxt.config.ts` to bypass that crash, `npm i better-sqlite3`, then `npm run generate && cat .output/public/llms.txt`.

Cache staleness note: the page database persisted under `node_modules/.cache/nuxt-seo/ai-ready/routes` is keyed by content hash only. When `NUXT_SITE_URL` changes between builds (preview vs production), cached entries keep their old absolute origin and page set, so llms.txt is generated with the previous environment's URLs until the cache directory is deleted. Including the site origin in the cache key would avoid baking preview URLs into production output on build machines with persistent caches.

Environment: nuxt-ai-ready 1.4.0, Nuxt 4.4.8, Node 24, `site.trailingSlash: true`.
