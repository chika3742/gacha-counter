import { describe, expect, test } from "vitest"
import { computePityHistory, type ComputePityHistoryDeps } from "../../app/utils/pity-calculator"
import type { GachaLogEntry } from "../../app/types/db"
import type { GachaType, ConsecutiveOffBannerGuarantee } from "../../app/types/gacha-type"
import type { RarityMeta } from "../../app/constants"

const rarityMeta: RarityMeta = {
  rankTypes: [
    { rankType: "3", colorClass: "text-rarity-3", text: "☆3" },
    { rankType: "4", colorClass: "text-rarity-4", text: "☆4" },
    { rankType: "5", colorClass: "text-rarity-5", text: "☆5" },
  ],
  rareRankTypes: ["4", "5"],
  lowerRankType: "4",
  upperRankType: "5",
}

const capturingRadiance: ConsecutiveOffBannerGuarantee = {
  threshold: 3,
  startDate: "2024-08-28",
  markerLabelKey: "pity.genshin.capturingRadianceTriggered",
}

const genshinCharaBanner: GachaType = {
  id: "301",
  title: "gacha.genshin.eventCharacter",
  star5Pity: 90,
  star5PseudoPityBorder: 74,
  singleProb: 0.006,
  offBannerItems: ["keqing", "mona", "qiqi", "diluc", "jean"],
  consecutiveOffBannerGuarantee: capturingRadiance,
}

const genshinCharaBannerNoGuarantee: GachaType = {
  ...genshinCharaBanner,
  consecutiveOffBannerGuarantee: undefined,
}

let entrySeq = 0
const makeEntry = (
  time: string,
  rankType: string,
  itemName: string,
): GachaLogEntry => ({
  id: ++entrySeq,
  remoteId: `remote-${entrySeq}`,
  name: itemName,
  rankType,
  itemType: "Character",
  gachaType: "301",
  queryGachaType: "301",
  uid: "100000000",
  time,
  game: "genshin",
  lang: "ja-jp",
})

const deps: ComputePityHistoryDeps = {
  getName: entry => entry.name,
  getItemId: entry => entry.name,
  getImage: () => undefined,
}

const timeAfter = (i: number) => `2024-09-01 10:${String(i).padStart(2, "0")}:00`
const timeBefore = (i: number) => `2024-01-01 10:${String(i).padStart(2, "0")}:00`

const star5 = (i: number, name: string, when: (i: number) => string = timeAfter) =>
  makeEntry(when(i), "5", name)

const findByName = <T extends { name: string }>(list: T[], name: string): T =>
  list.find(e => e.name === name)!

describe("computePityHistory - basic classification", () => {
  test("first 5-star with no prior context is 50/50 (isDefinitive=false)", () => {
    const entries = [star5(1, "focus")]
    const { list } = computePityHistory(entries, genshinCharaBanner, rarityMeta, deps)
    expect(list[0]!.isDefinitive).toBe(false)
    expect(list[0]!.isStreakGuarantee).toBe(false)
    expect(list[0]!.offBanner).toBe(false)
  })

  test("after off-banner star5, next star5 is definitive", () => {
    const entries = [star5(1, "keqing"), star5(2, "focus")]
    const { list } = computePityHistory(entries, genshinCharaBanner, rarityMeta, deps)
    const first = findByName(list, "keqing")
    const second = findByName(list, "focus")
    expect(first.isDefinitive).toBe(false)
    expect(first.offBanner).toBe(true)
    expect(second.isDefinitive).toBe(true)
    expect(second.isStreakGuarantee).toBe(false)
  })
})

describe("computePityHistory - streak guarantee", () => {
  test("3 consecutive 50/50 losses then win → isStreakGuarantee=true", () => {
    const entries = [
      star5(1, "keqing"), // loss 1 (50/50)
      star5(2, "focus"), // definitive
      star5(3, "mona"), // loss 2 (50/50)
      star5(4, "focus"), // definitive
      star5(5, "diluc"), // loss 3 (50/50) — reaches threshold on next 50/50
      star5(6, "focus"), // definitive
      star5(7, "focus"), // 50/50 win → streak guarantee (streak was 3)
    ]
    const { list } = computePityHistory(entries, genshinCharaBanner, rarityMeta, deps)
    // list is reversed (newest first), so index 0 is the last entry
    const last = list[0]!
    expect(last.name).toBe("focus")
    expect(last.isDefinitive).toBe(false)
    expect(last.isStreakGuarantee).toBe(true)
  })

  test("only 2 consecutive 50/50 losses → no streak guarantee", () => {
    const entries = [
      star5(1, "keqing"),
      star5(2, "focus"), // definitive
      star5(3, "mona"),
      star5(4, "focus"), // definitive
      star5(5, "focus"), // 50/50 win (streak=2)
    ]
    const { list } = computePityHistory(entries, genshinCharaBanner, rarityMeta, deps)
    const last = list[0]!
    expect(last.isDefinitive).toBe(false)
    expect(last.isStreakGuarantee).toBe(false)
  })

  test("50/50 win resets streak", () => {
    const entries = [
      star5(1, "keqing"), // loss 1
      star5(2, "focus"), // definitive
      star5(3, "mona"), // loss 2
      star5(4, "focus"), // definitive
      star5(5, "focus"), // 50/50 win → streak reset to 0
      star5(6, "diluc"), // loss (streak=1)
      star5(7, "focus"), // definitive
      star5(8, "focus"), // 50/50 win → not guarantee (streak was 1)
    ]
    const { list } = computePityHistory(entries, genshinCharaBanner, rarityMeta, deps)
    const last = list[0]!
    expect(last.isDefinitive).toBe(false)
    expect(last.isStreakGuarantee).toBe(false)
  })
})

describe("computePityHistory - date gating (2024-08-28)", () => {
  test("all entries before 2024-08-28 → never triggers", () => {
    const entries = [
      star5(1, "keqing", timeBefore),
      star5(2, "focus", timeBefore),
      star5(3, "mona", timeBefore),
      star5(4, "focus", timeBefore),
      star5(5, "diluc", timeBefore),
      star5(6, "focus", timeBefore),
      star5(7, "focus", timeBefore),
    ]
    const { list } = computePityHistory(entries, genshinCharaBanner, rarityMeta, deps)
    expect(list.every(e => !e.isStreakGuarantee)).toBe(true)
  })

  test("entries spanning 2024-08-28: pre-5.0 losses do not count toward streak", () => {
    const entries = [
      star5(1, "keqing", timeBefore), // pre-5.0 loss (not counted)
      star5(2, "focus", timeBefore), // pre-5.0 definitive
      star5(3, "mona", timeBefore), // pre-5.0 loss (not counted)
      star5(4, "focus", timeBefore), // pre-5.0 definitive
      // ↓ post-5.0 starts
      star5(5, "diluc", timeAfter), // post-5.0 loss 1 (counted)
      star5(6, "focus", timeAfter), // definitive
      star5(7, "focus", timeAfter), // 50/50 win → NOT guarantee (streak=1, not 3)
    ]
    const { list } = computePityHistory(entries, genshinCharaBanner, rarityMeta, deps)
    expect(list[0]!.isStreakGuarantee).toBe(false)
  })
})

describe("computePityHistory - banners without guarantee", () => {
  test("guarantee=undefined banner → never triggers even with same pattern", () => {
    const entries = [
      star5(1, "keqing"),
      star5(2, "focus"),
      star5(3, "mona"),
      star5(4, "focus"),
      star5(5, "diluc"),
      star5(6, "focus"),
      star5(7, "focus"),
    ]
    const { list } = computePityHistory(entries, genshinCharaBannerNoGuarantee, rarityMeta, deps)
    expect(list.every(e => !e.isStreakGuarantee)).toBe(true)
  })
})

describe("computePityHistory - off-banner rate filter", () => {
  test("streak guarantee win is excluded from off-banner rate denominator", () => {
    const entries = [
      star5(1, "keqing"),
      star5(2, "focus"),
      star5(3, "mona"),
      star5(4, "focus"),
      star5(5, "diluc"),
      star5(6, "focus"),
      star5(7, "focus"), // streak guarantee win — should be excluded
    ]
    const { list } = computePityHistory(entries, genshinCharaBanner, rarityMeta, deps)

    // Replicate CounterRow's rank5OffBannerRate logic
    const considered = list.filter(e =>
      e.rank === "5" && e.isDefinitive === false && !e.isStreakGuarantee,
    )
    // Only 3 real 50/50 losses count (keqing, mona, diluc) — all off-banner.
    expect(considered.length).toBe(3)
    expect(considered.every(e => e.offBanner)).toBe(true)
    const rate = considered.filter(e => e.offBanner).length / considered.length
    expect(rate).toBe(1)
  })
})
