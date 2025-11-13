import vuetify, { transformAssetUrls } from "vite-plugin-vuetify"
import * as fs from "node:fs"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxtjs/i18n",
    "@pinia/nuxt",
    (_options, nuxt) => {
      nuxt.hooks.hook("vite:extendConfig", (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
  ],
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        // Google Fonts
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=M+PLUS+2:wght@100..900&family=Cairo:wght@200..1000&display=swap" },

        { rel: "icon", href: "/favicon.webp" },
      ],
    },
  },
  css: ["~/assets/css/global.sass"],
  runtimeConfig: {
    public: {
      builtAt: new Date().toISOString(),
      host: "https://gc.chikach.net",
    },
  },
  build: {
    transpile: ["vuetify"],
  },
  compatibilityDate: "2025-07-15",
  nitro: {
    preset: "cloudflare-pages-static",
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  typescript: {
    tsConfig: {
      exclude: [
        "../functions/**/*",
      ],
      compilerOptions: {
      },
    },
  },
  hooks: {
    "nitro:build:public-assets"() {
      fs.cpSync("./functions", "./dist/functions", { recursive: true })
    },
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  i18n: {
    defaultLocale: "ja",
    langDir: "../app/i18n/locales/",
    locales: [
      { code: "ja", language: "ja-jp", name: "日本語", file: "ja-jp.yml" },
      { code: "en", language: "en-us", name: "English (US)", file: "en-us.yml" },
    ],
    compilation: {
      strictMessage: false,
    },
  },
})
