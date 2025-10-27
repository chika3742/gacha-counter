// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
  ],
  devtools: { enabled: true },
  compatibilityDate: "2025-07-15",
  nitro: {
    preset: "cloudflare-pages-static",
  },
  typescript: {
    tsConfig: {
      exclude: [
        "../functions/**/*",
      ],
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
})
