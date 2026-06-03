import type { GameType } from "~~/functions/constants.js"
import type { GachaLogEntry } from "~/types/db.js"
import {
  EXPORT_SCHEMA_PATH,
  EXPORT_SCHEMA_VERSION,
  parseImportJson,
  UnsupportedVersionError,
} from "~/types/export.js"
import { getAllByGameFromDb, importEntriesToDb } from "~/dexie/db.js"
import {
  downloadJson,
  exportFilename,
  MAX_IMPORT_FILE_SIZE,
  readTextFile,
} from "~/utils/history-io.js"

export const useHistoryIo = () => {
  const snackbar = useSnackbar()
  const i18n = useI18n()
  const config = useConfigStore()
  const runtime = useRuntimeConfig()

  const exportHistory = async (games: GameType[]) => {
    const rows = (await Promise.all(games.map(game => getAllByGameFromDb(game)))).flat()
    if (rows.length === 0) {
      snackbar.show(i18n.t("io.nothingToExport"), "error")
      return
    }

    const payload = {
      $schema: `${runtime.public.host}${EXPORT_SCHEMA_PATH}`,
      schemaVersion: EXPORT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      entries: rows.map(({ id, ...rest }) => rest),
    }

    downloadJson(exportFilename(games), payload)
    snackbar.show(i18n.t("io.exported", { count: rows.length }))
  }

  // Reads + validates the file without touching the DB. Returns the parsed
  // entries (game selection happens in the UI), or null on any error.
  const parseImportFile = async (file: File): Promise<Omit<GachaLogEntry, "id">[] | null> => {
    if (file.size > MAX_IMPORT_FILE_SIZE) {
      snackbar.show(i18n.t("io.fileTooLarge"), "error")
      return null
    }

    let raw: unknown
    try {
      raw = JSON.parse(await readTextFile(file))
    } catch (e) {
      console.error(e)
      snackbar.show(i18n.t("io.importInvalid"), "error")
      return null
    }

    let entries: Omit<GachaLogEntry, "id">[]
    try {
      entries = parseImportJson(raw)
    } catch (e) {
      console.error(e)
      const key = e instanceof UnsupportedVersionError ? "io.unsupportedVersion" : "io.importInvalid"
      snackbar.show(i18n.t(key), "error")
      return null
    }

    if (entries.length === 0) {
      snackbar.show(i18n.t("io.importEmpty"), "error")
      return null
    }

    return entries
  }

  const importEntries = async (entries: Omit<GachaLogEntry, "id">[], games: GameType[]) => {
    const filtered = entries.filter(e => games.includes(e.game))
    const { imported, skipped } = await importEntriesToDb(filtered)

    if (imported === 0 && skipped === 0) {
      snackbar.show(i18n.t("io.importEmpty"), "error")
      return
    }

    // Switch the view only if the current game wasn't among the user's
    // selection, so imported data is visible without surprising jumps.
    if (games.length > 0 && !games.includes(config.game)) {
      config.game = games[0]!
    }

    snackbar.show(i18n.t("io.imported", { imported, skipped }))
  }

  return { exportHistory, parseImportFile, importEntries }
}
