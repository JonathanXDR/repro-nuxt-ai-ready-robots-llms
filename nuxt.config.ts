export default defineNuxtConfig({
  modules: ['nuxt-ai-ready'],
  site: {
    url: 'https://example.com',
    name: 'AI Ready repro',
    trailingSlash: true,
  },
  compatibilityDate: '2026-03-21',
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/about/'],
    },
    // Use the pure-JS mdream twin so the markdown engine has no native
    // addon. nuxt-ai-ready only imports htmlToMarkdown/streamHtmlToMarkdown,
    // both provided by @mdream/js. Keeps the build WebContainer-friendly.
    alias: {
      mdream: '@mdream/js',
    },
  },
  // Bug 1: with `contentSignal` set as an object and NO top-level
  // `robots` key in this config, `nuxt prepare` crashes with
  // "Cannot read properties of undefined (reading 'groups')".
  // Add `robots: {}` to this config to work around the crash and
  // reproduce Bug 2 instead.
  aiReady: {
    // D1 driver avoids the native better-sqlite3 runtime dependency.
    database: {
      type: 'd1',
    },
    contentSignal: {
      aiTrain: false,
      search: true,
      aiInput: true,
    },
  },
})
