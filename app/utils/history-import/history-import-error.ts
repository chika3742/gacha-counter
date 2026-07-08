export type HistoryImportErrorCode
  = | "invalid-json"
    | "invalid-schema"
    | "item-mapping-failed"
    | "uid-mismatch"
    | "lang-mismatch"
    | "unknown"

export class HistoryImportError extends Error {
  constructor(public code: HistoryImportErrorCode, message?: string) {
    super(message ?? `History import error: ${code}`)
  }
}
