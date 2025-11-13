import type { GameType } from "~~/functions/constants.js"
import type { GachaType } from "~/types/gacha-type.js"

const offBannerGenshinChara = [
  "yumemizuki-mizuki", "dehya", "tighnari", "keqing", "mona", "qiqi", "diluc", "jean",
]
const offBannerGenshinWeapon = [
  "skyward-blade", "aquila-favonia", "wolfs-gravestone", "skyward-pride", "primordial-jade-winged-spear",
  "skyward-spine", "lost-prayer-to-the-sacred-winds", "skyward-atlas", "amos-bow", "skyward-harp",
]
const offBannerHsrChara = [
  "himeko", "welt", "bronya", "gepard", "clara", "yanqing", "bailu",
]
const offBannerHsrLC = [
  "night-on-the-milky-way", "something-irreplaceable", "but-the-battle-isnt-over",
  "in-the-name-of-the-world", "moment-of-victory", "sleep-like-the-dead", "time-waits-for-no-one",
]
const offBannerZzzAgents = [
  "Nekomata", "Soldier 11", "Koleda", "Lycaon", "Grace", "Rina",
]
const offBannerZzzWEngines = [
  "Steel Cushion", "The Brimstone", "Hellfire Gears", "The Restrained", "Fusion Compiler", "Weeping Cradle",
]

export const gachaTypes: Record<GameType, GachaType[]> = {
  genshin: [
    {
      id: "301",
      title: "gacha.genshin.eventCharacter",
      star5Pity: 90,
      star5PseudoPityBorder: 74,
      singleProb: 0.006,
      offBannerItems: offBannerGenshinChara,
    },
    {
      id: "302",
      title: "gacha.genshin.eventWeapon",
      star5Pity: 80,
      star5PseudoPityBorder: 64,
      singleProb: 0.007,
      offBannerItems: offBannerGenshinWeapon,
    },
    {
      id: "500",
      title: "gacha.genshin.chronicled",
      star5Pity: 90,
      star5PseudoPityBorder: 74,
      singleProb: 0.006,
      offBannerItems: [...offBannerGenshinChara, ...offBannerGenshinWeapon],
    },
    {
      id: "200",
      title: "gacha.genshin.standard",
      star5Pity: 90,
      star5PseudoPityBorder: 74,
      singleProb: 0.006,
      offBannerItems: [],
    },
  ],
  hsr: [
    {
      id: "11",
      title: "gacha.hsr.eventCharacter",
      star5Pity: 90,
      star5PseudoPityBorder: 74,
      singleProb: 0.006,
      offBannerItems: offBannerHsrChara,
    },
    {
      id: "12",
      title: "gacha.hsr.eventLightCone",
      star5Pity: 80,
      star5PseudoPityBorder: 64,
      singleProb: 0.008,
      offBannerItems: offBannerHsrLC,
    },
    {
      id: "21",
      title: "gacha.hsr.collabCharacter",
      star5Pity: 90,
      star5PseudoPityBorder: 74,
      singleProb: 0.006,
      offBannerItems: offBannerHsrChara,
    },
    {
      id: "22",
      title: "gacha.hsr.collabLightCone",
      star5Pity: 80,
      star5PseudoPityBorder: 64,
      singleProb: 0.008,
      offBannerItems: offBannerHsrLC,
    },
    {
      id: "1",
      title: "gacha.hsr.standard",
      star5Pity: 90,
      star5PseudoPityBorder: 74,
      singleProb: 0.006,
      offBannerItems: [],
    },
  ],
  zzz: [
    {
      id: "2",
      title: "gacha.zzz.exclusiveChannel",
      star5Pity: 90,
      star5PseudoPityBorder: 74,
      singleProb: 0.006,
      offBannerItems: offBannerZzzAgents,
    },
    {
      id: "3",
      title: "gacha.zzz.wEngineChannel",
      star5Pity: 80,
      star5PseudoPityBorder: 64,
      singleProb: 0.01,
      offBannerItems: offBannerZzzWEngines,
    },
    {
      id: "1",
      title: "gacha.zzz.stableChannel",
      star5Pity: 90,
      star5PseudoPityBorder: 74,
      singleProb: 0.006,
      offBannerItems: [],
    },
    {
      id: "5",
      title: "gacha.zzz.bangbooChannel",
      star5Pity: 80,
      star5PseudoPityBorder: 64,
      singleProb: 0.01,
      offBannerItems: [],
    },
  ],
}

export interface RarityMeta {
  rankTypes: {
    rankType: string
    colorClass: string
    text: string
  }[]
  rareRankTypes: string[]
  lowerRankType: string
  upperRankType: string
}

const genshinAndHsr: RarityMeta = {
  rankTypes: [
    {
      rankType: "3",
      colorClass: "text-rarity-3",
      text: "☆3",
    },
    {
      rankType: "4",
      colorClass: "text-rarity-4",
      text: "☆4",
    },
    {
      rankType: "5",
      colorClass: "text-rarity-5",
      text: "☆5",
    },
  ],
  rareRankTypes: ["4", "5"],
  lowerRankType: "4",
  upperRankType: "5",
}
export const rarityMetaRecord: Record<GameType, RarityMeta> = {
  genshin: genshinAndHsr,
  hsr: genshinAndHsr,
  zzz: {
    rankTypes: [
      {
        rankType: "2",
        colorClass: "text-rarity-3",
        text: "B",
      },
      {
        rankType: "3",
        colorClass: "text-rarity-4",
        text: "A",
      },
      {
        rankType: "4",
        colorClass: "text-rarity-5",
        text: "S",
      },
    ],
    rareRankTypes: ["3", "4"],
    lowerRankType: "3",
    upperRankType: "4",
  },
}

export const rankTypeToText = (meta: RarityMeta, rankType: string) => {
  return meta.rankTypes.find(e => e.rankType === rankType)?.text ?? ""
}

export const rankTypeToColorClass = (meta: RarityMeta, rankType: string) => {
  return meta.rankTypes.find(e => e.rankType === rankType)?.colorClass ?? ""
}
