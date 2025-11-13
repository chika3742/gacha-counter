import Dexie, { type EntityTable } from "dexie"
import type { GachaLogEntry } from "~/types/db.js"
import { gachaTypeRecord, type GameType } from "~~/functions/constants.js"

const db = new Dexie("gacha-counter") as Dexie & {
  gachaLogs: EntityTable<GachaLogEntry, "id">
}

db.version(1).stores({
  gachaLogs: "++id, [game+queryGachaType]",
})

export const getLatestIdsFromDb = async (game: GameType) => {
  const results = await Promise.all(gachaTypeRecord[game].map(async (gachaType) => {
    return db.gachaLogs.where({ game, queryGachaType: gachaType.id }).last()
  }))
  return Object.fromEntries(results.filter(e => e).map(e => [e!.queryGachaType, e!.remoteId]))
}

export const getLastLog = (game: GameType) => {
  return db.gachaLogs.where({ game }).last()
}

export const clearByGameFromDb = async (game: GameType) => {
  await db.gachaLogs.where({ game }).delete()
}

export { db }
