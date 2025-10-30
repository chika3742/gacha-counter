import type { GameType } from "~~/functions/constants.js"
import type { GachaLogResponseItem } from "~~/functions/types.js"

export interface GachaLogEntry {
  id: number
  remoteId: string
  name: string
  rankType: string
  itemType: "Character" | "Light Cone" | "Weapon"
  gachaType: string
  queryGachaType: string
  time: string
  game: GameType
}

export const toGachaLogEntry = (from: GachaLogResponseItem, game: GameType): Omit<GachaLogEntry, "id"> => ({
  remoteId: from.id,
  name: from.name,
  rankType: from.rank_type,
  itemType: from.item_type,
  time: from.time,
  gachaType: from.gacha_type,
  queryGachaType: from.queryGachaType,
  game,
})
