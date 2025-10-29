import * as z from "zod"
import { gameTypes } from "./constants.js"

export interface GachaTypeMeta {
  id: string
  apiEndpoint: string
}

export const GachaLogResponseItem = z.object({
  id: z.string(),
  name: z.string(),
  rank_type: z.string(),
  item_type: z.enum(["Character", "Light Cone", "Weapon"] as const),
  time: z.string(),
})

export type GachaLogResponseItem = z.infer<typeof GachaLogResponseItem>

export interface GachaLogResponse {
  retcode: number
  message: string
  data?: {
    list: GachaLogResponseItem[]
  }
}

export const FetchGachaLogRequest = z.object({
  game: z.enum(gameTypes),
  authkey: z.string().min(1),
  region: z.string().min(1),
  endIds: z.record(z.string(), z.string()),
  untilLatestRare: z.boolean().optional().default(false),
})
export type FetchGachaLogRequest = z.infer<typeof FetchGachaLogRequest>

export const FetchStatus = z.object({
  status: z.enum(["processing", "done", "error"] as const),
  game: z.enum(gameTypes),
  error: z.union([
    z.object({
      type: z.literal("remote-api-error"),
      retcode: z.number().optional(),
    }),
    z.object({
      type: z.literal("unknown"),
    }),
  ]).optional(),
  fetchedCount: z.number().optional(),
  gachaTypeProgress: z.number().optional(),
  totalGachaTypes: z.number().optional(),
  result: z.array(GachaLogResponseItem).optional(),
})

export type FetchStatus = z.infer<typeof FetchStatus>
