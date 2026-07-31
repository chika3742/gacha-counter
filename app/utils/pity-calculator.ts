import { DateTime } from "luxon"
import type { GachaLogEntry } from "~/types/db.js"
import type { GachaType } from "~/types/gacha-type.js"
import type { RarityMeta } from "~/constants.js"

export interface PityCountListItem {
  entryId: string
  rank: string
  type: string
  name: string
  count: number | null
  countColorClass: string
  offBanner: boolean
  isDefinitive: boolean | null
  isStreakGuarantee: boolean
  dateTime: DateTime
  importImageUrl: string | undefined
}

export interface ComputePityHistoryDeps {
  getName: (entry: GachaLogEntry) => string
  getItemId: (entry: GachaLogEntry) => string | undefined
  getImage: (entry: GachaLogEntry) => string | undefined
}

export interface ComputePityHistoryResult {
  list: PityCountListItem[]
  counts: Record<string, number>
}

/**
 * Computes per-entry pity metadata (count, definitive/50-50 state, streak
 * guarantee flag) for a gacha history.
 *
 * Streak-guarantee model (e.g. Genshin's "Capturing Radiance"):
 *   Once a player loses N consecutive 50/50 rolls in the target period,
 *   the next 50/50 win is treated as guaranteed. Losses inside a definitive
 *   pull do not count toward the streak.
 *
 * @param {GachaLogEntry[]} entries - The list of gacha log entries to be processed.
 * @param {GachaType} gachaType - The type of gacha (e.g., event, standard) with specific rules for guarantees and probabilities.
 * @param {RarityMeta} rarityMeta - Metadata defining rarity types and thresholds (e.g., rare rank types and upper rank type).
 * @param {ComputePityHistoryDeps} deps - Dependencies that provide helper functions such as retrieving names, item IDs, and images for entries.
 *
 * @returns {ComputePityHistoryResult} An object containing the computed pity history list and a map of remaining pity counts by rank type.
 */
export const computePityHistory = (
  entries: GachaLogEntry[],
  gachaType: GachaType,
  rarityMeta: RarityMeta,
  deps: ComputePityHistoryDeps,
): ComputePityHistoryResult => {
  const result: PityCountListItem[] = []

  const pityCount: Record<string, number> = {}
  for (const rankType of rarityMeta.rareRankTypes) {
    pityCount[rankType] = 0
  }

  const guarantee = gachaType.consecutiveOffBannerGuarantee
  const guaranteeStartDate = guarantee
    ? DateTime.fromISO(guarantee.startDate)
    : null

  let definitive = false
  let offBannerStreak = 0

  for (const entry of entries) {
    for (const key of Object.keys(pityCount)) {
      pityCount[key]!++
    }

    const name = deps.getName(entry)
    const dateTime = DateTime.fromFormat(entry.time, "yyyy-MM-dd HH:mm:ss")
    const isRarest = entry.rankType === rarityMeta.upperRankType
    const offBanner = gachaType.offBannerItems.includes(deps.getItemId(entry) ?? name)

    const isGuaranteeTargetPeriod = !!guarantee
      && guaranteeStartDate?.isValid
      && dateTime.isValid
      && dateTime >= guaranteeStartDate

    let isStreakGuarantee = false
    if (isRarest && guarantee && isGuaranteeTargetPeriod && !definitive && !offBanner
      && offBannerStreak >= guarantee.threshold) {
      isStreakGuarantee = true
    }

    const item: PityCountListItem = {
      entryId: entry.remoteId,
      name,
      type: entry.itemType,
      count: pityCount[entry.rankType] ?? null,
      countColorClass: getNumberColorClass(
        pityCount[entry.rankType],
        entry.rankType,
        gachaType.star5PseudoPityBorder,
        rarityMeta,
      ),
      offBanner,
      isDefinitive: isRarest ? definitive : null,
      isStreakGuarantee,
      dateTime,
      rank: entry.rankType,
      importImageUrl: deps.getImage(entry),
    }
    result.push(item)

    if (entry.rankType in pityCount) {
      pityCount[entry.rankType] = 0
    }

    if (isRarest) {
      const wasFiftyFifty = !definitive
      if (offBanner) {
        if (wasFiftyFifty && isGuaranteeTargetPeriod) offBannerStreak++
        definitive = true
      } else {
        if (wasFiftyFifty && isGuaranteeTargetPeriod) {
          offBannerStreak = 0
        }
        definitive = false
      }
    }
  }

  return { list: result.reverse(), counts: pityCount }
}

const getNumberColorClass = (
  count: number | undefined,
  rank: string,
  pseudoPityBorder: number,
  rarityMeta: RarityMeta,
): string => {
  if (!count) {
    return ""
  }

  if (rank === rarityMeta.lowerRankType) {
    return count >= 10 ? "text-pity" : "text-lucky"
  } else if (rank === rarityMeta.upperRankType) {
    return count > pseudoPityBorder ? "text-pity" : "text-lucky"
  } else {
    return ""
  }
}
