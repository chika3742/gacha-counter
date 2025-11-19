import type { GameType } from "~~/functions/constants.js"

const gsOrigin = "https://gs.hoyoverse.com"

const urlOrigins: Record<GameType, string[]> = {
  genshin: ["https://public-operation-hk4e-sg.hoyoverse.com", gsOrigin],
  hsr: ["https://public-operation-hkrpg-sg.hoyoverse.com", gsOrigin],
  zzz: ["https://public-operation-nap-sg.hoyoverse.com", gsOrigin],
}

export const parseKeyUrl = (url: string, game: GameType) => {
  const parsedUrl = new URL(url)
  const params = parsedUrl.searchParams

  if (!urlOrigins[game].includes(parsedUrl.origin)) {
    throw new Error("Invalid URL: origin mismatch")
  }

  const authkey = params.get("authkey")
  const region = params.get("region")
  const gameBiz = params.get("game_biz")
  const lang = params.get("lang")
  if (!authkey || !region || !gameBiz || !lang) {
    throw new Error("Invalid URL: missing required parameters")
  }

  return {
    authkey,
    region,
    gameBiz,
    lang,
  }
}
