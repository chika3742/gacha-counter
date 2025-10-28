import * as z from "zod"
import type { GachaLogResponseItem } from "../utils/gacha-api.js"
import { GachaApi } from "../utils/gacha-api.js"
import { GachaApiError, GachaLooper } from "../utils/gacha-looper.js"
import { gachaTypeRecord, gameTypes } from "../utils/gacha-types.js"

const FetchGachaLogRequest = z.object({
  game: z.enum(gameTypes),
  authkey: z.string().min(1),
  region: z.string().min(1),
  endIds: z.record(z.string(), z.string()),
  untilLatestRare: z.boolean().optional().default(false),
})

export type FetchGachaLogRequest = z.infer<typeof FetchGachaLogRequest>
interface FetchStatus {
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

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 })
  }

  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()
  const sendStatus = async (data: FetchStatus) => {
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
  }

  let request: FetchGachaLogRequest
  try {
    request = FetchGachaLogRequest.parse(await context.request.json())
  } catch (e) {
    console.error("Failed to parse the request.", e)
    return new Response("Bad Request", { status: 400 })
  }

  const api = new GachaApi(request.authkey, request.region)
  const looper = new GachaLooper(api, gachaTypeRecord[request.game])

  looper.onProgress = () => {
    sendStatus({
      status: "processing",
      fetchedCount: looper.fetchedCount,
      gachaTypeProgress: looper.gachaTypeProgress,
      totalGachaTypes: looper.totalGachaTypes,
    })
  }

  void (async () => {
    try {
      const result = await looper.fetchAllGachaTypes(request.endIds)

      await sendStatus({
        status: "done",
        result,
      })
    } catch (e) {
      let error: FetchStatus["error"]
      if (e instanceof GachaApiError) {
        error = {
          type: "remote-api-error",
          retcode: e.response.retcode,
        }
      } else {
        console.error(e)
        error = {
          type: "unknown",
        }
      }
      await sendStatus({
        status: "error",
        error,
      })
    }

    await writer.close()
  })()

  return new Response(readable, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      "connection": "keep-alive",
    },
  })
}
