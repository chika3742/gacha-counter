import { GachaApi } from "./gacha-api.js"
import type { FetchGachaLogRequest, GachaLogResponse, GachaLogResponseItem, GachaTypeMeta, GameMeta } from "../types.js"
import { takeWhile } from "es-toolkit"

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class GachaLooper {
  constructor(
    public readonly api: GachaApi,
    public readonly gachaTypes: GachaTypeMeta[],
    public readonly gameMeta: GameMeta,
    public readonly untilLatestRare: boolean,
    public readonly uid: string | null,
    public readonly lang: string | null,
  ) {
    this.totalGachaTypes = gachaTypes.length
  }

  onProgress: (() => void) | undefined
  fetchedCount: number = 0
  gachaTypeProgress: number = 0
  totalGachaTypes: number
  private newResults: GachaLogResponseItem[] = []
  consumeResults() {
    const results = this.newResults
    this.newResults = []
    return results
  }

  private async fetchGachaType(type: GachaTypeMeta, latestId: string | undefined) {
    let _endId = "0"
    let fetchedLowerRare = false
    let fetchedUpperRare = false

    while (true) {
      const response = await this.api.getGachaLog(
        type,
        _endId,
        this.gameMeta.respectLang ? this.lang : "en",
        this.gameMeta.queryKey,
      )
      if (response.data.list.length > 0 && this.uid && response.data.list[0].uid !== this.uid) {
        throw new UidMismatchError()
      }
      const newItems = takeWhile(response.data.list, item => item.id !== latestId)
        .map(item => ({
          ...item,
          queryGachaType: type.id,
        }))
      this.newResults.push(...newItems)
      this.fetchedCount += newItems.length
      this.onProgress?.()

      if (this.untilLatestRare) {
        for (const item of newItems) {
          if (item.rank_type === this.gameMeta.lowerRankType) fetchedLowerRare = true
          if (item.rank_type === this.gameMeta.upperRankType) fetchedUpperRare = true
        }
        if (fetchedLowerRare && fetchedUpperRare) {
          break
        }
      }
      if (newItems.length < GachaApi.itemsPerPage) {
        break
      }
      _endId = newItems.slice(-1)[0].id
      await sleep(800)
    }
  }

  async fetchAllGachaTypes(latestIds: FetchGachaLogRequest["latestIds"]) {
    for (const gachaType of this.gachaTypes) {
      this.gachaTypeProgress++
      this.onProgress?.()
      await this.fetchGachaType(gachaType, latestIds[gachaType.id])
      await sleep(800)
    }
  }
}

export class GachaApiError extends Error {
  constructor(public readonly response: GachaLogResponse) {
    super()
  }
}

export class UidMismatchError extends Error {
  constructor() {
    super("UID mismatch")
  }
}
