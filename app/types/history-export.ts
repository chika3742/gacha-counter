export const exportFormats = ["gacha-counter", "uigf"] as const

export type ExportFormat = typeof exportFormats[number]

export type ImportFormat = "gacha-counter" | "uigf" | "hsr-material"
