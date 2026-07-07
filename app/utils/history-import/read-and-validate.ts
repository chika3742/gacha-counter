import type { GameType } from "~~/functions/constants"
import { HistoryImportError, type HistoryImportErrorCode } from "./history-import-error"
import type { GachaLogEntry } from "~/types/db"
import { InternalExportFormat } from "~/types/internal-export-format"
import { HsrMaterialExportFormat } from "~/types/hsr-material-export-format"
import hCharacters from "~/assets/remote/hsr/data/characters.json"
import hLightCones from "~/assets/remote/hsr/data/light-cones.json"
import { db } from "~/dexie/db"
import { Uigf4 } from "~/types/uigf4"
import type { ImportFormat } from "~/types/history-export"

export type GachaLogEntryInsertable = Omit<GachaLogEntry, "id">
export type ValidationResult = {
  format: ImportFormat
  exportedAt: Date
  games: {
    gameType: GameType
    gachaCount: number
    uid: string
    error?: HistoryImportErrorCode
  }[]
  dbEntries: GachaLogEntryInsertable[]
} | {
  uidPromptRequired: true
  pendingParsedData: HsrMaterialExportFormat
}

export type ValidationResultUidPromptRequired = Exclude<ValidationResult, { format: unknown }>
export type ValidationResultSuccess = Exclude<ValidationResult, { uidPromptRequired: unknown }>

export const readAndValidateHistory = async (file: File): Promise<ValidationResult> => {
  const text = await file.text()
  let data: unknown[]
  try {
    data = JSON.parse(text)
  } catch (error) {
    console.error(error)
    throw new HistoryImportError("invalid-json")
  }

  return await parseInternalFormat(data)
    ?? await parseHsrFormat(data)
    ?? await parseUigfFormat(data)
    ?? (() => {
      throw new HistoryImportError("invalid-schema")
    })()
}

const parseInternalFormat = async (data: unknown): Promise<ValidationResult | null> => {
  const { success, data: parsed } = InternalExportFormat.safeParse(data)
  if (!success) {
    return null
  }

  const games: Extract<ValidationResult, { games: unknown }>["games"] = []
  const dbEntries: GachaLogEntryInsertable[] = []
  for (const [game, entries] of Object.entries(parsed.games)) {
    if (entries.length === 0) {
      continue
    }
    const uid = entries[0]!.uid
    if (!await verifyUid(game as GameType, uid)) {
      games.push({
        gameType: game as GameType,
        gachaCount: entries.length,
        uid,
        error: "uid-mismatch",
      })
      continue
    }

    games.push({
      gameType: game as GameType,
      gachaCount: entries.length,
      uid,
    })

    dbEntries.push(...entries.map(e => ({
      remoteId: e.id,
      name: e.name,
      rankType: e.rankType,
      itemType: e.itemType,
      queryGachaType: e.queryGachaType,
      gachaType: e.gachaType,
      uid,
      time: e.time,
      lang: e.lang,
      game: game as GameType,
    })))
  }

  return {
    format: "gacha-counter",
    exportedAt: new Date(parsed.exportedAt),
    games,
    dbEntries,
  }
}

const parseHsrFormat = async (data: unknown): Promise<ValidationResult | null> => {
  const { success, data: parsed } = HsrMaterialExportFormat.safeParse(data)
  if (!success) {
    return null
  }

  return {
    uidPromptRequired: true,
    pendingParsedData: parsed,
  }
}

export const continueParsingHsrFormat = async (parsed: HsrMaterialExportFormat, uid: string): Promise<ValidationResultSuccess> => {
  const flattened = parsed.banners.flatMap(banner => banner.warps)

  const itemTypeMap = {
    キャラクター: "Character",
    光円錐: "Light Cone",
  }

  const mapItemName = (name: string, itemType: string): string => {
    const result = Object.values(itemType === "キャラクター" ? hCharacters : hLightCones)
      .find(item => item.name.locales.ja === name)?.name.locales.en
    if (!result) {
      throw new HistoryImportError("item-mapping-failed", `Failed to convert a Japanese item name ${name} into English.`)
    }
    return result
  }

  const mapDbEntries = async (): Promise<GachaLogEntryInsertable[]> => {
    if (!await verifyUid("hsr", uid)) {
      throw new HistoryImportError("uid-mismatch")
    }
    return flattened.map(e => ({
      remoteId: e.id,
      name: mapItemName(e.name, e.itemType),
      itemType: itemTypeMap[e.itemType],
      gachaType: e.gachaType,
      queryGachaType: e.gachaType,
      game: "hsr",
      lang: "en-us",
      time: e.time,
      rankType: e.rankType,
      uid: uid,
    }))
  }

  let dbEntries: GachaLogEntryInsertable[] = []
  let error: HistoryImportErrorCode | undefined
  try {
    dbEntries = await mapDbEntries()
  } catch (e) {
    console.error(e)
    error = e instanceof HistoryImportError ? e.code : "unknown"
  }

  return {
    format: "hsr-material",
    exportedAt: new Date(parsed.exportedAt),
    games: [{
      gameType: "hsr",
      uid,
      gachaCount: flattened.length,
      error,
    }],
    dbEntries,
  }
}

const parseUigfFormat = async (data: unknown): Promise<ValidationResult | null> => {
  const { success, data: parsed } = Uigf4.safeParse(data)
  if (!success) {
    return null
  }

  if (!parsed.hk4e) {
    return {
      format: "uigf",
      exportedAt: new Date(parsed.info.export_timestamp),
      games: [],
      dbEntries: [],
    }
  }

  const games: Extract<ValidationResult, { games: unknown }>["games"] = []
  const dbEntries: GachaLogEntryInsertable[] = []

  for (const account of parsed.hk4e) {
    const uid = account.uid
    const mapDbEntries = async (): Promise<typeof dbEntries> => {
      if (!await verifyUid("genshin", uid)) {
        throw new HistoryImportError("uid-mismatch")
      }

      return account.list.map((e) => {
        const item = findGItemById(e.item_id)
        if (!item) {
          throw new HistoryImportError("item-mapping-failed", `Cannot find an item from item id ${e.item_id}`)
        }

        return {
          remoteId: e.id,
          name: item.name.locales.en,
          rankType: item.rarity.toString(),
          itemType: e.item_id.length === CHARACTER_ID_LENGTH ? "Character" : "Weapon",
          queryGachaType: e.uigf_gacha_type,
          gachaType: e.gacha_type,
          uid,
          time: e.time,
          lang: "en-us",
          game: "genshin" as const,
        }
      })
    }

    let mappedEntries: typeof dbEntries = []
    let error: HistoryImportErrorCode | undefined
    try {
      mappedEntries = await mapDbEntries()
    } catch (e) {
      console.error(e)
      if (e instanceof HistoryImportError) {
        error = e.code
      } else {
        error = "unknown"
      }
    }

    games.push({
      gameType: "genshin",
      gachaCount: account.list.length,
      uid,
      error,
    })

    dbEntries.push(...mappedEntries)
  }

  return {
    format: "uigf",
    exportedAt: new Date(parsed.info.export_timestamp),
    games,
    dbEntries,
  }
}

/**
 * Verifies if the given UID matches the latest row in the gacha log for the specified game.
 * @param uid Input UID
 */
const verifyUid = async (game: GameType, uid: string): Promise<boolean> => {
  const entry = await db.gachaLogs.where("game").equals(game).last()
  return !entry || entry.uid === uid
}
