import z from "zod";

export const Uigf4 = z.object({
  info: z.object({
    export_timestamp: z.coerce.number<string | number>(),
    export_app: z.string(),
    export_app_version: z.string(),
    version: z.string(),
  }),
  hk4e: z.array(z.object({
    uid: z.coerce.string<string | number>(),
    timezone: z.number(),
    lang: z.enum([
      "de-de",
      "en-us",
      "es-es",
      "fr-fr",
      "id-id",
      "it-it",
      "ja-jp",
      "ko-kr",
      "pt-pt",
      "ru-ru",
      "th-th",
      "tr-tr",
      "vi-vn",
      "zh-cn",
      "zh-tw"
    ]).optional(),
    list: z.array(z.object({
      uigf_gacha_type: z.string().regex(/^\d+$/),
      gacha_type: z.string().regex(/^\d+$/),
      item_id: z.string().regex(/^\d+$/),
      count: z.string().optional(),
      time: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
      name: z.string().optional(),
      item_type: z.string().optional(),
      rank_type: z.string().optional(),
      id: z.string().regex(/^\d+$/),
    }))
  })).optional()
})

export type Uigf4 = z.input<typeof Uigf4>

export type Uigf4Parsed = z.output<typeof Uigf4>
