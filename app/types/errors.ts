import type { FetchStatus } from "~~/functions/types.js"

export class GachaFetchApiError extends Error {
  constructor(public readonly errorResponse: FetchStatus["error"] & {}) {
    super()
  }

  get messageI18nKey() {
    switch (this.errorResponse.type) {
      case "remote-api-error":
        switch (this.errorResponse.retcode) {
          case -101:
            return "errors.authKeyTimeout"
          case -100:
            return "errors.invalidAuthKey"
          case -110:
            return "errors.tooManyRequests"
          default:
            return "errors.unknown"
        }
      case "uid-mismatch":
        return "errors.uidMismatch"
      case "unknown":
        return "errors.unknown"
    }
  }
}

export class GachaFetchClientError extends Error {
  constructor(public readonly messageI18nKey: string, cause: Error) {
    super(messageI18nKey, { cause })
  }
}
