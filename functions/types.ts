import * as z from "zod"
import { gameTypes } from "./constants.js"

export interface GachaTypeMeta {
  id: string
  apiEndpoint: string
}

export interface GachaLogResponseItem {
  id: string
  name: string
  rank_type: string
  item_type: "Character" | "Light Cone" | "Weapon"
  time: string
}

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

export interface FetchStatus {
  status: "processing" | "done" | "error"
  error?: {
    type: "remote-api-error"
    retcode?: number
  } | {
    type: "unknown"
  }
  fetchedCount?: number
  gachaTypeProgress?: number
  totalGachaTypes?: number
  result?: GachaLogResponseItem[]
}
