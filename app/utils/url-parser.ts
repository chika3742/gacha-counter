import type { GameType } from "~~/functions/constants.js"

const urlOrigins: Record<GameType, string[]> = {
  genshin: ["https://public-operation-hk4e-sg.hoyoverse.com"],
  hsr: ["https://public-operation-hkrpg-sg.hoyoverse.com"],
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
  if (!authkey || !region || !gameBiz) {
    throw new Error("Invalid URL: missing authkey or region")
  }

  return {
    authkey,
    region,
    gameBiz,
  }
}
