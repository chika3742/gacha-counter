import { GachaApi } from "../utils/gacha-api.js"
import { GachaApiError, GachaLooper, UidMismatchError } from "../utils/gacha-looper.js"
import { gachaTypeRecord } from "../constants.js"
import type { FetchStatus } from "../types.js"
import { FetchGachaLogRequest } from "../types.js"

// noinspection JSUnusedGlobalSymbols
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
  const looper = new GachaLooper(api, gachaTypeRecord[request.game], request.untilLatestRare, request.uid)

  looper.onProgress = () => {
    sendStatus({
      status: "processing",
      game: request.game,
      fetchedCount: looper.fetchedCount,
      gachaTypeProgress: looper.gachaTypeProgress,
      totalGachaTypes: looper.totalGachaTypes,
    })
  }

  void (async () => {
    try {
      const result = await looper.fetchAllGachaTypes(request.latestIds)

      await sendStatus({
        status: "done",
        game: request.game,
        result,
      })
    } catch (e) {
      let error: FetchStatus["error"]
      if (e instanceof GachaApiError) {
        error = {
          type: "remote-api-error",
          retcode: e.response.retcode,
        }
      } else if (e instanceof UidMismatchError) {
        error = {
          type: "uid-mismatch",
        }
      } else {
        console.error(e)
        error = {
          type: "unknown",
        }
      }
      await sendStatus({
        status: "error",
        game: request.game,
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
