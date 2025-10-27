export const gameTypes = ["hsr", "genshin"] as const
export type GameType = typeof gameTypes[number]

export interface GachaTypeMeta {
  id: string
  apiEndpoint: string
}

export interface GachaLogResponseItem {
  id: string
  name: string
  rank_type: string
  item_type: "Character" | "Light Cone" | "Weapon"
  time: string
}

export interface GachaLogResponse {
  retcode: number
  message: string
  data?: {
    list: GachaLogResponseItem[]
  }
}

export class GachaApi {
  constructor(
    public readonly authKey: string,
    public readonly region: string,
  ) {}

  static itemsPerPage = 20

  get commonParams() {
    return {
      authkey_ver: "1",
      sign_type: "2",
      auth_appid: "webview_gacha",
      lang: "en",
      game_biz: "hkrpg_global",
      size: GachaApi.itemsPerPage.toString(),
      authkey: this.authKey,
      region: this.region,
    }
  }

  async getGachaLog(type: GachaTypeMeta, endId?: string) {
    const params = {
      ...this.commonParams,
      gacha_type: type.id,
      end_id: endId ?? "0",
    }
    const url = new URL(`${type.apiEndpoint}?${new URLSearchParams(params).toString()}`)

    const result = await fetch(url)
    if (!result.ok) {
      throw new Error(`Request failed with status ${result.status} ${result.statusText}`)
    }
    return await result.json<GachaLogResponse>()
  }
}
