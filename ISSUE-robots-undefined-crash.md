# Module setup crashes with "Cannot read properties of undefined (reading 'groups')" when nuxt.config has no robots key

## The bug

When `aiReady.contentSignal` is configured as an object and `nuxt.config.ts` has no top-level `robots` key, `nuxt prepare` crashes during module setup:

```
ERROR  Cannot read properties of undefined (reading 'groups')

    at setup (node_modules/nuxt-ai-ready/dist/module.mjs:676:33)
    at async normalizedModule (node_modules/@nuxt/kit/dist/index.mjs:169:10)
    at async installModules (node_modules/@nuxt/kit/dist/index.mjs:570:3)
    at async initNuxt (node_modules/nuxt/dist/index.mjs:7337:3)
```

The crash happens during `nuxt prepare`, before any prerender or database work, so it needs no native dependencies to reproduce.

## To reproduce

https://stackblitz.com/github/JonathanXDR/repro-nuxt-ai-ready-robots-llms

The default `startCommand` runs `nuxt prepare` and the crash above is printed in the terminal.

## Expected behavior

A missing `robots` key should be treated the same as an empty `robots: {}`. The module should default the options and push its content-signal group without throwing.

## Additional context

Root cause in `node_modules/nuxt-ai-ready/dist/module.mjs` (1.4.0):

```js
// line 673
if (typeof config.contentSignal === "object") {
  const robotsOpts = nuxt.options.robots !== false ? nuxt.options.robots : {};  // line 674
  nuxt.options.robots = robotsOpts;                                             // line 675
  const groups = robotsOpts.groups || [];                                       // line 676 (throws)
```

The guard at line 674 only handles `robots: false`. When the user has no `robots` key at all, `nuxt.options.robots` is `undefined`, `undefined !== false` is true, so `robotsOpts` is assigned `undefined` and the `.groups` read on the next line throws.

A nullish coalesce fixes it:

```js
const robotsOpts = nuxt.options.robots !== false ? (nuxt.options.robots ?? {}) : {};
```

Workaround: declare an empty `robots: {}` in `nuxt.config.ts`.

Environment: nuxt-ai-ready 1.4.0, Nuxt 4.4.8, Node 24. The repro pins `@nuxtjs/robots` 6.1.0.
