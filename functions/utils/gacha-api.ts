import type { GachaLogResponse, GachaTypeMeta } from "../types.js"
import { GachaApiError } from "./gacha-looper.js"

export class GachaApi {
  constructor(
    public readonly authKey: string,
    public readonly region: string,
    public readonly gameBiz: string,
  ) {}

  static itemsPerPage = 20

  get commonParams() {
    return {
      authkey_ver: "1",
      sign_type: "2",
      auth_appid: "webview_gacha",
      game_biz: this.gameBiz,
      size: GachaApi.itemsPerPage.toString(),
      authkey: this.authKey,
      region: this.region,
    }
  }

  static readonly headers = {
    "user-agent": "Mozilla/5.0 (iPad; CPU OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "origin": "https://gs.hoyoverse.com",
    "referer": "https://gs.hoyoverse.com/",
  }

  async getGachaLog(type: GachaTypeMeta, endId: string | undefined, lang: string, queryKey: string): Promise<GachaLogResponse> {
    const params = {
      ...this.commonParams,
      [queryKey]: type.id,
      lang,
      end_id: endId ?? "0",
    }
    const url = new URL(`${type.apiEndpoint}?${new URLSearchParams(params).toString()}`)

    const result = await fetch(url, {
      headers: GachaApi.headers,
    })
    if (!result.ok) {
      throw new Error(`Request failed with status ${result.status} ${result.statusText}`)
    }
    const parsedResult = await result.json<GachaLogResponse>()
    if (parsedResult.retcode !== 0) {
      throw new GachaApiError(parsedResult)
    }
    return parsedResult
  }
}
