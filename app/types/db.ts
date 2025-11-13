import type { GameType } from "~~/functions/constants.js"
import type { GachaLogResponseItem } from "~~/functions/types.js"

export interface GachaLogEntry {
  id: number
  remoteId: string
  name: string
  rankType: string
  itemType: GachaLogResponseItem["item_type"]
  gachaType: string
  queryGachaType: string
  uid: string
  time: string
  game: GameType
  lang: string
}

export const toGachaLogEntry = (from: GachaLogResponseItem, game: GameType): Omit<GachaLogEntry, "id"> => ({
  remoteId: from.id,
  name: from.name,
  rankType: from.rank_type,
  itemType: from.item_type,
  time: from.time,
  gachaType: from.gacha_type,
  queryGachaType: from.queryGachaType,
  uid: from.uid,
  lang: from.lang,
  game,
})
