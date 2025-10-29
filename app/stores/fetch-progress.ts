import { type FetchGachaLogRequest, FetchStatus } from "~~/functions/types.js"
import { fetchEventSource } from "@microsoft/fetch-event-source"

export const useFetchProgressStore = defineStore("fetch-progress", {
  state: () => ({} as Partial<FetchStatus>),
  actions: {
    async fetch(request: FetchGachaLogRequest) {
      const updateState = (data: FetchStatus) => {
        Object.assign(this, data)
      }

      await fetchEventSource("/api/fetch-gacha-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        async onopen(resp) {
          if (!resp.ok) {
            throw new Error(`Request failed with status ${resp.status} ${resp.statusText}`)
          }
        },
        onmessage(ev) {
          const data = FetchStatus.parse(JSON.parse(ev.data))
          updateState(data)
          console.log(data)
        },
        onerror(err) {
          throw err
        },
      })
    },
  },
})
