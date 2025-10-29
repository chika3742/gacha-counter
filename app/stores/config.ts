import type { GameType } from "~~/functions/constants.js"

export const useConfigStore = defineStore("config", () => {
  const state = {
    game: ref("genshin" as GameType),
    urlRecord: ref({} as Record<GameType, string>),
    fetchAllHistory: ref({} as Record<GameType, boolean>),
  } satisfies Record<string, Ref>

  // Localstorage hydration
  onMounted(() => {
    const saved = localStorage.getItem("config")
    if (saved) {
      for (const stateKey in state) {
        const value = JSON.parse(saved)[stateKey]
        if (typeof value !== "undefined") {
          state[stateKey as keyof typeof state]!.value = value
        }
      }
    }
  })

  // Localstorage persistence
  for (const stateKey in state) {
    watch(state[stateKey as keyof typeof state]!, (newValue) => {
      let saved = {}
      try {
        saved = JSON.parse(localStorage.getItem("config") || "{}")
      } catch { /* parsing error */ }
      saved = {
        ...saved,
        [stateKey]: newValue,
      }
      localStorage.setItem("config", JSON.stringify(saved))
    })
  }

  return state
})
