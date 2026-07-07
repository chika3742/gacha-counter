import { groupBy } from "es-toolkit"
import type { GachaLogEntry } from "~/types/db"
import type { ExportGameEntry, InternalExportFormat } from "~/types/internal-export-format"

export const mapToInternalFormat = (input: GachaLogEntry[]): InternalExportFormat => {
  const grouped = groupBy(input, e => e.game)
  const mapped = Object.fromEntries(
    Object.entries(grouped).map(([game, entries]) => [
      game,
      entries.map(e => ({
        id: e.remoteId,
        itemType: e.itemType,
        lang: e.lang,
        name: e.name,
        queryGachaType: e.queryGachaType,
        gachaType: e.gachaType,
        rankType: e.rankType,
        time: e.time,
        uid: e.uid,
      } satisfies ExportGameEntry)),
    ]),
  )

  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    games: {
      genshin: mapped["genshin"] ?? [],
      hsr: mapped["hsr"] ?? [],
      zzz: mapped["zzz"] ?? [],
    },
  }
}
