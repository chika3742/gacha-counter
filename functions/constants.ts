import type { GachaTypeMeta, GameMeta } from "./types.js"

export const requestSchemaVersion = 2

const genshinEp = "https://public-operation-hk4e-sg.hoyoverse.com/gacha_info/api/getGachaLog"
const hsrEp = "https://public-operation-hkrpg-sg.hoyoverse.com/common/gacha_record/api/getGachaLog"
const hsrLdEp = "https://public-operation-hkrpg-sg.hoyoverse.com/common/gacha_record/api/getLdGachaLog"
const zzzEp = "https://public-operation-nap-sg.hoyoverse.com/common/gacha_record/api/getGachaLog"

export const gameTypes = ["hsr", "genshin", "zzz"] as const
export type GameType = typeof gameTypes[number]

export const gachaTypeRecord: Record<GameType, GachaTypeMeta[]> = {
  hsr: [
    {
      id: "11",
      apiEndpoint: hsrEp,
    },
    {
      id: "12",
      apiEndpoint: hsrEp,
    },
    {
      id: "21",
      apiEndpoint: hsrLdEp,
    },
    {
      id: "22",
      apiEndpoint: hsrLdEp,
    },
    {
      id: "1",
      apiEndpoint: hsrEp,
    },
  ],
  genshin: [
    {
      id: "301",
      apiEndpoint: genshinEp,
    },
    {
      id: "302",
      apiEndpoint: genshinEp,
    },
    {
      id: "500",
      apiEndpoint: genshinEp,
    },
    {
      id: "200",
      apiEndpoint: genshinEp,
    },
  ],
  zzz: [
    {
      id: "2",
      apiEndpoint: zzzEp,
    },
    {
      id: "3",
      apiEndpoint: zzzEp,
    },
    {
      id: "1",
      apiEndpoint: zzzEp,
    },
    {
      id: "5",
      apiEndpoint: zzzEp,
    },
  ],
}

export const gameMetaRecord: Record<GameType, GameMeta> = {
  genshin: {
    queryKey: "gacha_type",
    respectLang: false,
    lowerRankType: "4",
    upperRankType: "5",
  },
  hsr: {
    queryKey: "gacha_type",
    respectLang: false,
    lowerRankType: "4",
    upperRankType: "5",
  },
  zzz: {
    queryKey: "real_gacha_type",
    respectLang: true,
    lowerRankType: "3",
    upperRankType: "4",
  },
}
