import type { GameType } from "~~/functions/constants.js"

export const MAX_IMPORT_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

export const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error("file-read-error"))
    reader.readAsText(file)
  })
}

export const exportFilename = (games: GameType[]) => {
  const date = new Date().toISOString().slice(0, 10) // yyyy-MM-dd
  return `gacha-counter-${games.join("-")}-${date}.json`
}
