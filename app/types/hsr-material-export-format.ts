import z from "zod"

export const HsrMaterialExportFormat = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.iso.datetime(),
  banners: z.array(z.object({
    type: z.string().regex(/^\d+$/),
    name: z.string(),
    warps: z.array(z.object({
      id: z.string().regex(/^\d+$/),
      gachaType: z.string().regex(/^\d+$/),
      time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
      /**
       * Character or light cone name in Japanese
       */
      name: z.string(),
      itemType: z.enum(["キャラクター", "光円錐"]),
      rankType: z.enum(["3", "4", "5"]),
    })),
  })),
})

export type HsrMaterialExportFormat = z.infer<typeof HsrMaterialExportFormat>
