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
}
