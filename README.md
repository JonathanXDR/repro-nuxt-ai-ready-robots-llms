# nuxt-ai-ready reproduction

Minimal reproduction repository for two nuxt-ai-ready 1.4.0 bugs:

1. [ISSUE-robots-undefined-crash.md](./ISSUE-robots-undefined-crash.md):
   module setup crashes when `nuxt.config.ts` has no `robots` key and
   `contentSignal` is configured.
2. [ISSUE-llms-txt-duplicate-index-routes.md](./ISSUE-llms-txt-duplicate-index-routes.md):
   llms.txt lists every prerendered page twice, once under a 404ing
   `/.../index` URL.

## Steps

```sh
npm install   # crashes during nuxt prepare (bug 1)
```

Then add `robots: {}` to `nuxt.config.ts` and run:

```sh
npm run generate
cat .output/public/llms.txt   # duplicate /index entries (bug 2)
```
