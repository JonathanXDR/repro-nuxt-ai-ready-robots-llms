# Bug: module setup crashes with "Cannot read properties of undefined (reading 'groups')" when nuxt.config has no `robots` key

### Module version

nuxt-ai-ready 1.4.0

### Environment

- Nuxt 4.4.8
- `aiReady.contentSignal` configured as an object
- No top-level `robots` key in `nuxt.config.ts`

### Reproduction

This repository as is. Run `npm install` (the `postinstall` script runs `nuxt prepare`):

```
ERROR  Cannot read properties of undefined (reading 'groups')
  at setup (node_modules/nuxt-ai-ready/dist/module.mjs:676)
```

### Root cause

In `dist/module.mjs` (1.4.0, around line 674):

```js
const robotsOpts = nuxt.options.robots !== false ? nuxt.options.robots : {};
nuxt.options.robots = robotsOpts;
const groups = robotsOpts.groups || [];
```

The guard only handles `robots: false`. When the user has no `robots` key at all, `nuxt.options.robots` is `undefined`, `undefined !== false` is true, so `robotsOpts` becomes `undefined` and the `.groups` read throws.

### Suggested fix

```js
const robotsOpts
  = nuxt.options.robots !== false ? (nuxt.options.robots ?? {}) : {};
```

### Workaround

Declare an empty `robots: {}` in `nuxt.config.ts`.
