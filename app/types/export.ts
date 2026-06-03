import * as z from "zod"
import { gameTypes } from "~~/functions/constants.js"
import type { GachaLogEntry } from "~/types/db.js"

export const EXPORT_SCHEMA_VERSION = 1
export const EXPORT_SCHEMA_PATH = "/schemas/history-export.schema.json"

// ---- The app's own export format (multi-game, flat list) ----
export const ExportEntry = z.object({
  game: z.enum(gameTypes),
  remoteId: z.string(),
  name: z.string(),
  rankType: z.string(),
  itemType: z.string(),
  gachaType: z.string(),
  queryGachaType: z.string(),
  uid: z.string(),
  lang: z.string(),
  time: z.string(),
})
export type ExportEntry = z.infer<typeof ExportEntry>

export const HistoryExport = z.object({
  $schema: z.string().optional(),
  schemaVersion: z.literal(EXPORT_SCHEMA_VERSION),
  exportedAt: z.string(),
  entries: z.array(ExportEntry),
})
export type HistoryExport = z.infer<typeof HistoryExport>

// ---- HSR warp-export format (hsr-material / hsr.matnote.app) ----
// https://github.com/chika3742/hsr-material/blob/main/packages/nuxt/public/schemas/warp-export.schema.json
const hsrBannerType = z.enum(["1", "11", "12", "21", "22"])

const WarpExportItem = z.object({
  id: z.string(),
  gachaType: hsrBannerType,
  time: z.string(),
  name: z.string(),
  itemType: z.enum(["キャラクター", "光円錐"]),
  rankType: z.enum(["3", "4", "5"]),
})

const WarpExportBanner = z.object({
  type: hsrBannerType,
  name: z.string(),
  warps: z.array(WarpExportItem),
})

export const WarpExport = z.object({
  exportedAt: z.string(),
  schemaVersion: z.literal(1),
  banners: z.array(WarpExportBanner),
})
export type WarpExport = z.infer<typeof WarpExport>

// warp-export itemType is Japanese; map to the internal English form that the
// rest of the app (item-info.ts) expects.
const warpItemTypeMap: Record<WarpExport["banners"][number]["warps"][number]["itemType"], string> = {
  キャラクター: "Character",
  光円錐: "Light Cone",
}

// ---- Converters to Omit<GachaLogEntry, "id"> ----
export const exportToEntries = (data: HistoryExport): Omit<GachaLogEntry, "id">[] => {
  return data.entries.map(e => ({ ...e }))
}

export const warpExportToEntries = (data: WarpExport): Omit<GachaLogEntry, "id">[] => {
  return data.banners.flatMap(banner =>
    banner.warps.map(warp => ({
      remoteId: warp.id,
      name: warp.name,
      rankType: warp.rankType,
      itemType: warpItemTypeMap[warp.itemType],
      // queryGachaType is the grouping key (matches gachaTypes.hsr ids); use the
      // banner type. gachaType keeps the per-warp value in case they diverge.
      queryGachaType: banner.type,
      gachaType: warp.gachaType,
      uid: "",
      lang: "ja",
      time: warp.time,
      game: "hsr" as const,
    })),
  )
}

export class UnsupportedVersionError extends Error {}
export class UnrecognizedFormatError extends Error {}

// Detect the format and convert to entries. Throws UnsupportedVersionError when
// a known shape is present but the version doesn't match, and
// UnrecognizedFormatError when nothing matches.
export const parseImportJson = (raw: unknown): Omit<GachaLogEntry, "id">[] => {
  const own = HistoryExport.safeParse(raw)
  if (own.success) {
    return exportToEntries(own.data)
  }
  const warp = WarpExport.safeParse(raw)
  if (warp.success) {
    return warpExportToEntries(warp.data)
  }

  // Distinguish "known format, wrong version" from "unknown format" so users get
  // a meaningful message and a future v2 file isn't treated as broken.
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>
    const knownShape = Array.isArray(obj.entries) || Array.isArray(obj.banners)
    if (knownShape && obj.schemaVersion !== EXPORT_SCHEMA_VERSION) {
      throw new UnsupportedVersionError()
    }
  }
  throw new UnrecognizedFormatError()
}
