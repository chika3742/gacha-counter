<script setup lang="ts">
import iconGenshin from "~/assets/img/icon_genshin.png"
import iconHsr from "~/assets/img/icon_hsr.png"
import iconZzz from "~/assets/img/icon_zzz.png"
import { GachaFetchApiError, GachaFetchClientError } from "~/types/errors.js"
import { type GameType, requestSchemaVersion } from "~~/functions/constants.js"
import { clearByGameFromDb, countByGameFromDb, db, getLastLog, getLatestIdsFromDb } from "~/dexie/db.js"
import { useObservable } from "@vueuse/rxjs"
import Dexie, { liveQuery } from "dexie"
import type { GachaLogEntry } from "~/types/db.js"
import CounterRows from "~/components/CounterRows.vue"
import { gachaTypes } from "~/constants.js"

const snackbar = useSnackbar()
const dialog = useDialog()
const i18n = useI18n()
const config = useConfigStore()
const progress = useFetchProgressStore()

useHead({
  title: computed(() => i18n.t(`games.${config.game}`)),
})

const games = [
  {
    name: i18n.t("games.genshin"),
    id: "genshin",
    img: iconGenshin,
    color: "#ec723c",
  },
  {
    name: i18n.t("games.hsr"),
    id: "hsr",
    img: iconHsr,
    color: "#85f38c",
  },
  {
    name: i18n.t("games.zzz"),
    id: "zzz",
    img: iconZzz,
    color: "#85c5f3",
    requireLocaleText: true,
  },
]

const urlRecord = ref({} as Record<GameType, string>)
const urlError = ref("")

const url = computed({
  get: () => urlRecord.value[config.game] ?? "",
  set: (value: string) => urlRecord.value[config.game] = value,
})

const fetchAllHistory = computed({
  get: () => config.fetchAllHistory[config.game] ?? false,
  set: (value: boolean) => config.fetchAllHistory = { ...config.fetchAllHistory, [config.game]: value },
})

onMounted(() => {
  urlRecord.value = config.urlRecord
})

const progressText = computed(() => {
  if (!progress.status || progress.status !== "processing") {
    return null
  }

  if (!progress.totalGachaTypes) {
    return i18n.t("preparing")
  } else {
    return i18n.t("progress", {
      gacha: i18n.t(`placeholders.${progress.game}.gacha`),
      count: progress.fetchedCount,
      current: progress.gachaTypeProgress,
      total: progress.totalGachaTypes,
    })
  }
})

const processing = computed(() => !!progressText.value)

const history = computed(() => {
  const game = config.game
  return useObservable<GachaLogEntry[]>(
    liveQuery(() => db.gachaLogs
      .where("[game+queryGachaType+remoteId]")
      .between([game], [game, Dexie.maxKey, Dexie.maxKey])
      .toArray()) as any,
  )
})

const getHistory = async () => {
  let authkey: string, region: string, gameBiz: string, lang: string
  try {
    const urlRegex = /(https:\/\/\S+)/g
    const detectedUrl = urlRegex.exec(url.value)?.[1]
    if (!detectedUrl) {
      urlError.value = i18n.t("errors.invalidUrl")
      return
    }
    ({ authkey, region, gameBiz, lang } = parseKeyUrl(detectedUrl, config.game))
  } catch (e) {
    console.warn(e)
    urlError.value = i18n.t("errors.invalidUrl")
    return
  }
  urlError.value = ""

  try {
    const lastLog = await getLastLog(config.game)

    await progress.fetch({
      requestSchemaVersion,
      authkey,
      region,
      gameBiz,
      // `|| ` (not `?? `) so imported entries with an empty uid/lang fall back
      // to the URL-derived values instead of poisoning the fetch.
      lang: lastLog?.lang || lang,
      game: config.game,
      latestIds: await getLatestIdsFromDb(config.game),
      untilLatestRare: !fetchAllHistory.value,
      uid: lastLog?.uid || null,
    })

    config.urlRecord = {
      ...config.urlRecord,
      [config.game]: url.value,
    }

    if (progress.result && progress.fetchedCount) {
      snackbar.show(i18n.t("historyFetched", { count: progress.fetchedCount }))
    } else {
      snackbar.show(i18n.t("noNewHistory"))
    }
  } catch (e) {
    console.error(e)
    let i18nKey = "errors.unknown"
    if (e instanceof GachaFetchApiError) {
      i18nKey = e.messageI18nKey
    }
    if (e instanceof GachaFetchClientError) {
      i18nKey = e.messageI18nKey
    }
    snackbar.show(i18n.t(i18nKey), "error")
  }
}

const clearHistory = () => {
  dialog.show(
    i18n.t("clearHistory"),
    i18n.t("clearHistoryConfirm"),
    async () => {
      await clearByGameFromDb(config.game)
      snackbar.show(i18n.t("historyCleared"))
    },
  )
}

const { exportHistory, parseImportFile, importEntries } = useHistoryIo()
const fileInput = ref<HTMLInputElement | null>(null)

// Export dialog
const exportDialog = ref(false)
const exportGames = ref<GameType[]>([])
const gameCounts = ref<Record<GameType, number>>({} as Record<GameType, number>)

const openExportDialog = async () => {
  gameCounts.value = await countByGameFromDb()
  exportGames.value = (gameCounts.value[config.game] ?? 0) > 0 ? [config.game] : []
  exportDialog.value = true
}

const doExport = async () => {
  exportDialog.value = false
  await exportHistory(exportGames.value)
}

// Import dialog
const importDialog = ref(false)
const importGames = ref<GameType[]>([])
const importCounts = ref<Partial<Record<GameType, number>>>({})
const parsedEntries = ref<Omit<GachaLogEntry, "id">[]>([])

const importAvailableGames = computed(() =>
  games.filter(g => (importCounts.value[g.id as GameType] ?? 0) > 0))

const triggerImport = () => fileInput.value?.click()

const onFileSelected = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = "" // reset so re-selecting the same file fires change again
  if (!file) return

  const entries = await parseImportFile(file)
  if (!entries) return

  const counts: Partial<Record<GameType, number>> = {}
  for (const entry of entries) {
    counts[entry.game] = (counts[entry.game] ?? 0) + 1
  }
  parsedEntries.value = entries
  importCounts.value = counts
  importGames.value = Object.keys(counts) as GameType[]
  importDialog.value = true
}

const doImport = async () => {
  importDialog.value = false
  await importEntries(parsedEntries.value, importGames.value)
}
</script>

<template>
  <div class="doc-container d-flex flex-column ga-4">
    <v-btn-toggle
      v-model="config.game"
      style="height: 55px"
      :disabled="processing"
      mandatory
    >
      <v-btn
        v-for="entry in games"
        :key="entry.id"
        :value="entry.id"
        :text="entry.name"
        :color="entry.color"
      >
        <template #prepend>
          <v-img
            :src="entry.img"
            width="35px"
          />
        </template>
      </v-btn>
    </v-btn-toggle>

    <Description :game="config.game" />

    <section>
      <h2>{{ $t("urlInput") }}</h2>
      <v-text-field
        v-model="url"
        :disabled="processing"
        :error-messages="urlError"
        class="ma-2"
        clearable
        label="URL"
      />
      <div class="mb-4">
        <v-checkbox
          v-model="fetchAllHistory"
          :disabled="processing || !history.value || history.value.length > 0"
          :label="$t('fetchAllHistory')"
          color="primary"
          density="compact"
          hide-details
        />
        <div style="font-size: 0.9em">
          {{ $t("fetchAllHistoryDesc", { duration: $t(`fetchAllHistoryDescDuration.${config.game}`) }) }}
        </div>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="application/json,.json"
        style="display: none"
        @change="onFileSelected"
      >
      <v-row
        no-gutters
        style="gap: 16px"
      >
        <v-spacer />
        <v-btn
          :disabled="processing"
          @click="triggerImport"
        >
          {{ $t("io.import") }}
        </v-btn>
        <v-btn
          :disabled="processing"
          @click="openExportDialog"
        >
          {{ $t("io.export") }}
        </v-btn>
        <v-btn
          :disabled="processing"
          @click="clearHistory"
        >
          {{ $t("clearHistory") }}
        </v-btn>
        <v-btn
          :loading="processing"
          color="primary"
          @click="getHistory"
        >
          {{ $t("getHistory") }}
        </v-btn>
      </v-row>
      <div
        v-show="processing"
        class="mt-2"
        style="text-align: end"
      >
        {{ progressText }}
      </div>
    </section>

    <article>
      <CounterRows
        :entries="history.value ?? []"
        :gacha-types="gachaTypes[config.game]"
        :game="config.game"
        :show-pity-history="fetchAllHistory"
      />
    </article>

    <v-dialog
      v-model="exportDialog"
      max-width="400px"
    >
      <v-card :title="$t('io.exportTitle')">
        <template #text>
          <v-checkbox
            v-for="entry in games"
            :key="entry.id"
            v-model="exportGames"
            :value="entry.id"
            :disabled="(gameCounts[entry.id as GameType] ?? 0) === 0"
            :label="`${entry.name} (${gameCounts[entry.id as GameType] ?? 0})`"
            color="primary"
            density="compact"
            hide-details
          />
        </template>
        <template #actions>
          <v-spacer />
          <v-btn @click="exportDialog = false">
            {{ $t("ui.cancel") }}
          </v-btn>
          <v-btn
            :disabled="exportGames.length === 0"
            color="primary"
            @click="doExport"
          >
            {{ $t("io.export") }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="importDialog"
      max-width="400px"
    >
      <v-card :title="$t('io.importTitle')">
        <template #text>
          <v-checkbox
            v-for="entry in importAvailableGames"
            :key="entry.id"
            v-model="importGames"
            :value="entry.id"
            :label="`${entry.name} (${importCounts[entry.id as GameType] ?? 0})`"
            color="primary"
            density="compact"
            hide-details
          />
        </template>
        <template #actions>
          <v-spacer />
          <v-btn @click="importDialog = false">
            {{ $t("ui.cancel") }}
          </v-btn>
          <v-btn
            :disabled="importGames.length === 0"
            color="primary"
            @click="doImport"
          >
            {{ $t("io.import") }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped lang="sass">

</style>
