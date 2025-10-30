import { type FetchGachaLogRequest, FetchStatus } from "~~/functions/types.js"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import { GachaFetchApiError, GachaFetchClientError } from "~/types/errors.js"
import { toGachaLogEntry } from "~/types/db.js"
import { db } from "~/dexie/db.js"

export const useFetchProgressStore = defineStore("fetch-progress", {
  state: () => ({} as Partial<FetchStatus>),
  actions: {
    async fetch(request: FetchGachaLogRequest) {
      const updateState = (data: Partial<FetchStatus>) => {
        Object.assign(this, data)

        if (data.status === "done" && data.result) {
          const list = data.result.map(e => toGachaLogEntry(e, request.game))
          db.gachaLogs.bulkAdd(list.toReversed())
        }
      }

      await fetchEventSource("/api/fetch-gacha-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        async onopen(resp) {
          if (!resp.ok) {
            throw new GachaFetchClientError(
              "errors.network",
              new Error(`Request failed with status ${resp.status} ${resp.statusText}`),
            )
          }
        },
        onmessage(ev) {
          let data: FetchStatus
          try {
            data = FetchStatus.parse(JSON.parse(ev.data))
          } catch (e) {
            updateState({ status: "error" })
            throw new GachaFetchClientError("errors.invalidResponse", e as Error)
          }
          updateState(data)
          if (data.error) {
            throw new GachaFetchApiError(data.error)
          }
        },
        onerror(err) {
          throw err
        },
      })
    },
  },
})
