# nuxt-ai-ready reproduction

Minimal reproduction for two nuxt-ai-ready 1.4.0 bugs:

1. [ISSUE-robots-undefined-crash.md](./ISSUE-robots-undefined-crash.md): module setup crashes when `nuxt.config.ts` has no `robots` key and `contentSignal` is set as an object.
2. [ISSUE-llms-txt-duplicate-index-routes.md](./ISSUE-llms-txt-duplicate-index-routes.md): llms.txt lists every nested page under a non-existent `/.../index` URL.

## Bug 1 (native-free, runs in StackBlitz)

```sh
npm install
npm run repro   # nuxt prepare -> "Cannot read properties of undefined (reading 'groups')"
```

This is what the StackBlitz `startCommand` runs.

## Bug 2 (needs the build-time SQLite writer)

The build-time page database uses `better-sqlite3` (a native addon that does not load in WebContainer), so run this on a normal machine:

```sh
# add `robots: {}` to nuxt.config.ts to bypass Bug 1
npm i better-sqlite3
npm run generate
cat .output/public/llms.txt   # /about, /about/, and a bogus /about/index
```

## Notes

`nuxt.config.ts` sets `aiReady.database.type: 'd1'` and aliases `mdream` to the pure-JS `@mdream/js` twin so the prepare step has no native dependency. No lockfile is committed (StackBlitz defaults to npm).
