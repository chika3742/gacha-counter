import { db } from "~/dexie/db"
import type { GachaLogEntryInsertable } from "./read-and-validate"

/**
 * Imports the insertable into the db
 * @param entries Entries to import
 * @returns The count of imported entries.
 */
export const importHistory = async (entries: GachaLogEntryInsertable[]): Promise<number> => {
  let failures = 0
  await db.gachaLogs.bulkAdd(entries).catch("BulkError", err => {
    failures = err.failures.length
  })
  
  return entries.length - failures
}