import { GachaApi } from "./gacha-api.js"
import type { FetchGachaLogRequest, GachaLogResponse, GachaLogResponseItem, GachaTypeMeta } from "../types.js"
import { takeWhile } from "es-toolkit"

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class GachaLooper {
  constructor(
    public readonly api: GachaApi,
    public readonly gachaTypes: GachaTypeMeta[],
    public readonly untilLatestRare: boolean,
    public readonly uid: string | undefined,
  ) {
    this.totalGachaTypes = gachaTypes.length
  }

  onProgress: (() => void) | undefined
  fetchedCount: number = 0
  gachaTypeProgress: number = 0
  totalGachaTypes: number

  private async fetchGachaType(type: GachaTypeMeta, latestId: string | undefined) {
    const result: GachaLogResponseItem[] = []
    let _endId = "0"

    while (true) {
      const response = await this.api.getGachaLog(type, _endId)
      if (response.retcode !== 0) {
        throw new GachaApiError(response)
      }
      if (response.data.list.length > 0 && this.uid && response.data.list[0].uid !== this.uid) {
        throw new UidMismatchError()
      }
      const newItems = takeWhile(response.data.list, item => item.id !== latestId)
        .map(item => ({
          ...item,
          queryGachaType: type.id,
        }))
      result.push(...newItems)
      this.fetchedCount += newItems.length
      this.onProgress?.()

      if (this.untilLatestRare && GachaLooper.containsRareItems(result)) {
        break
      }
      if (newItems.length < GachaApi.itemsPerPage) {
        break
      }
      _endId = newItems.slice(-1)[0].id
      await sleep(800)
    }

    return result
  }

  async fetchAllGachaTypes(latestIds: FetchGachaLogRequest["latestIds"]) {
    const result: GachaLogResponseItem[] = []
    for (const gachaType of this.gachaTypes) {
      this.gachaTypeProgress++
      this.onProgress?.()
      result.push(...await this.fetchGachaType(gachaType, latestIds[gachaType.id]))
      await sleep(800)
    }
    return result
  }

  private static containsRareItems(items: GachaLogResponseItem[]) {
    return items.some(e => e.rank_type === "4")
      && items.some(e => e.rank_type === "5")
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
