import type { GachaLogResponse, GachaLogResponseItem, GachaTypeMeta } from "./gacha-api.js"
import { GachaApi } from "./gacha-api.js"
import type { FetchGachaLogRequest } from "../api/fetch-gacha-log.js"

export class GachaLooper {
  constructor(
    public readonly api: GachaApi,
    public readonly gachaTypes: GachaTypeMeta[],
    public readonly untilLatestRare: boolean = false,
  ) {
    this.totalGachaTypes = gachaTypes.length
  }

  onProgress: (() => void) | undefined
  fetchedCount: number = 0
  gachaTypeProgress: number = 0
  totalGachaTypes: number

  private async fetchGachaType(type: GachaTypeMeta, endId: string) {
    const result: GachaLogResponseItem[] = []
    let _endId = endId

    while (true) {
      const response = await this.api.getGachaLog(type, _endId)
      if (response.retcode !== 0) {
        throw new GachaApiError(response)
      }
      result.push(...response.data.list)
      this.fetchedCount += response.data.list.length
      this.onProgress?.()

      if (this.untilLatestRare && this.containsRareItems(result)) {
        break
      }
      if (response.data.list.length < GachaApi.itemsPerPage) {
        break
      }
      _endId = response.data.list.slice(-1)[0].id
    }

    return result
  }

  async fetchAllGachaTypes(endIds: FetchGachaLogRequest["endIds"]) {
    const result: GachaLogResponseItem[] = []
    for (const gachaType of this.gachaTypes) {
      this.gachaTypeProgress++
      this.onProgress?.()
      result.push(...await this.fetchGachaType(gachaType, endIds[gachaType.id] ?? "0"))
    }
    return result
  }

  containsRareItems(items: GachaLogResponseItem[]) {
    return items.some(e => e.rank_type === "4")
      && items.some(e => e.rank_type === "5")
  }
}

export class GachaApiError extends Error {
  constructor(public readonly response: GachaLogResponse) {
    super()
  }
}
