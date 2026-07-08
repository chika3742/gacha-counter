import z from "zod"

const GameEntry = z.array(z.object({
  id: z.string().regex(/^\d+$/),
  itemType: z.string(),
  lang: z.string(),
  name: z.string(),
  queryGachaType: z.string().regex(/^\d+$/),
  gachaType: z.string().regex(/^\d+$/),
  rankType: z.string().regex(/^\d+$/),
  time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
  uid: z.string().regex(/^\d{9,}$/),
}))

export const InternalExportFormat = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.iso.datetime(),
  games: z.object({
    genshin: GameEntry,
    hsr: GameEntry,
    zzz: GameEntry,
  }),
})

export type InternalExportFormat = z.infer<typeof InternalExportFormat>

export type ExportGameEntry = z.infer<typeof GameEntry>[number]
