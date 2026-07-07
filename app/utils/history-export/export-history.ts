import { db } from "~/dexie/db.js"
import type { ExportFormat } from "~/types/history-export.js"
import type { GameType } from "~~/functions/constants.js"
import { mapToUigf } from "./uigf"
import { mapToInternalFormat } from "./internal-format"

export const exportHistory = async (format: ExportFormat, games: GameType[]): Promise<void> => {
  if (games.length === 0) {
    throw new Error("No games selected for export")
  }

  const entries = await db.gachaLogs
    .where("game")
    .anyOf(games)
    .toArray()

  let output: string
  switch (format) {
    case "uigf":
      output = JSON.stringify(mapToUigf(entries), null, 2)
      break
    case "gacha-counter":
      output = JSON.stringify(mapToInternalFormat(entries), null, 2)
      break
  }
  const blob = new Blob([output], { type: "application/json" })
  const date = new Date().toISOString().slice(0, 10)
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `gacha-history-${format}-${date}.json`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
