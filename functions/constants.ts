import type { GachaTypeMeta } from "./types.js"

const genshinEp = "https://public-operation-hk4e-sg.hoyoverse.com/gacha_info/api/getGachaLog"
const hsrEp = "https://public-operation-hkrpg-sg.hoyoverse.com/common/gacha_record/api/getGachaLog"
const hsrLdEp = "https://public-operation-hkrpg-sg.hoyoverse.com/common/gacha_record/api/getLdGachaLog"

export const gameTypes = ["hsr", "genshin"] as const
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
}
