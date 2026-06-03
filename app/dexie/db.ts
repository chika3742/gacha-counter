import Dexie, { type EntityTable } from "dexie"
import type { GachaLogEntry } from "~/types/db.js"
import { gachaTypeRecord, gameTypes, type GameType } from "~~/functions/constants.js"

const db = new Dexie("gacha-counter") as Dexie & {
  gachaLogs: EntityTable<GachaLogEntry, "id">
}

db.version(1).stores({
  gachaLogs: "++id, [game+queryGachaType]",
})
db.version(2).stores({
  gachaLogs: "++id, &[game+queryGachaType+remoteId]",
})

export const getLatestIdsFromDb = async (game: GameType) => {
  const results = await Promise.all(gachaTypeRecord[game].map(async (gachaType) => {
    return db.gachaLogs
      .where("[game+queryGachaType+remoteId]")
      .between([game, gachaType.id], [game, gachaType.id, Dexie.maxKey])
      .last()
  }))
  return Object.fromEntries(results.filter(e => e).map(e => [e!.queryGachaType, e!.remoteId]))
}

export const getLastLog = (game: GameType) => {
  return db.gachaLogs.where({ game }).last()
}

export const clearByGameFromDb = async (game: GameType) => {
  await db.gachaLogs.where({ game }).delete()
}

const gameRange = (game: GameType) =>
  db.gachaLogs
    .where("[game+queryGachaType+remoteId]")
    .between([game], [game, Dexie.maxKey, Dexie.maxKey])

export const getAllByGameFromDb = (game: GameType) => {
  return gameRange(game).toArray()
}

export const countByGameFromDb = async (): Promise<Record<GameType, number>> => {
  const counts = await Promise.all(gameTypes.map(game => gameRange(game).count()))
  return Object.fromEntries(gameTypes.map((game, i) => [game, counts[i]])) as Record<GameType, number>
}

const compoundKey = (e: Pick<GachaLogEntry, "game" | "queryGachaType" | "remoteId">) =>
  `${e.game}|${e.queryGachaType}|${e.remoteId}`

export interface ImportResult {
  imported: number
  skipped: number
}

export const importEntriesToDb = async (
  entries: Omit<GachaLogEntry, "id">[],
): Promise<ImportResult> => {
  if (entries.length === 0) {
    return { imported: 0, skipped: 0 }
  }

  return db.transaction("rw", db.gachaLogs, async () => {
    // Collect existing keys for only the games present in the payload.
    const games = [...new Set(entries.map(e => e.game))]
    const existing = new Set<string>()
    await Promise.all(games.map(async (game) => {
      const rows = await gameRange(game).toArray()
      for (const row of rows) {
        existing.add(compoundKey(row))
      }
    }))

    // Filter out entries that already exist or are duplicated within the payload.
    const seen = new Set<string>()
    const toInsert: Omit<GachaLogEntry, "id">[] = []
    let skipped = 0
    for (const entry of entries) {
      const key = compoundKey(entry)
      if (existing.has(key) || seen.has(key)) {
        skipped++
        continue
      }
      seen.add(key)
      toInsert.push(entry)
    }

    try {
      await db.gachaLogs.bulkAdd(toInsert as GachaLogEntry[])
      return { imported: toInsert.length, skipped }
    } catch (e) {
      // Defensive: a concurrent writer (e.g. another tab) could have inserted a
      // colliding key between the read above and bulkAdd. Count actual successes.
      if (e instanceof Dexie.BulkError) {
        const failed = e.failures.length
        return { imported: toInsert.length - failed, skipped: skipped + failed }
      }
      throw e
    }
  })
}

export { db }
