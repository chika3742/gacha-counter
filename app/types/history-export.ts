export const exportFormats = ["gacha-counter", "uigf"] as const

export type ExportFormat = typeof exportFormats[number]
