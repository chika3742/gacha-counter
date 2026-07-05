import type { GachaLogEntry } from "~/types/db.js"
import type { Uigf42 } from "~/types/uigf-4.2.g.js"
import { groupBy } from "es-toolkit"
import { getHyvId } from "~/utils/item-info.js"

export const mapToUigf = (input: GachaLogEntry[]): Uigf42 => {
  const grouped = groupBy(input, e => e.game)

  const genshin = mapGenshin(grouped["genshin"] ?? [])

  const configs = useRuntimeConfig().public
  return {
    info: {
      export_app: `Gacha Counter (${configs.host})`,
      export_app_version: configs.builtAt,
      export_timestamp: Math.floor(Date.now() / 1000),
      version: "v4.2",
    },
    hk4e: genshin ? [genshin] : [],
  }
}

const mapGenshin = (entries: GachaLogEntry[]): NonNullable<Uigf42["hk4e"]>[number] | null => {
  if (entries.length === 0) {
    return null
  }

  return {
    uid: entries[0]!.uid,
    lang: entries[0]!.lang as any,
    timezone: new Date().getTimezoneOffset(),
    list: entries.map(e => ({
      id: e.remoteId,
      item_id: getHyvId(e)!.toString(),
      time: e.time,
      uigf_gacha_type: e.queryGachaType as any,
      gacha_type: e.gachaType as any,
      item_type: e.itemType,
      name: e.name,
      rank_type: e.rankType,
      count: "1",
    })),
  }
}
