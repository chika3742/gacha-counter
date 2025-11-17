<script setup lang="ts">
import iconGenshin from "~/assets/img/icon_genshin.png"
import iconHsr from "~/assets/img/icon_hsr.png"
import iconZzz from "~/assets/img/icon_zzz.png"
import { GachaFetchApiError, GachaFetchClientError } from "~/types/errors.js"
import { type GameType, requestSchemaVersion } from "~~/functions/constants.js"
import { clearByGameFromDb, db, getLastLog, getLatestIdsFromDb } from "~/dexie/db.js"
import { useObservable } from "@vueuse/rxjs"
import { liveQuery } from "dexie"
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
    liveQuery(() => db.gachaLogs.where({ game }).toArray()) as any,
  )
})

const getHistory = async () => {
  let authkey: string, region: string, gameBiz: string, lang: string
  try {
    ({ authkey, region, gameBiz, lang } = parseKeyUrl(url.value, config.game))
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
      lang: lastLog?.lang ?? lang,
      game: config.game,
      latestIds: await getLatestIdsFromDb(config.game),
      untilLatestRare: !fetchAllHistory.value,
      uid: lastLog?.uid ?? null,
    })

    config.urlRecord = {
      ...config.urlRecord,
      [config.game]: url.value,
    }

    if (progress.result && progress.result.length > 0) {
      snackbar.show(i18n.t("historyFetched", { count: progress.result.length }))
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
      <v-row
        no-gutters
        style="gap: 16px"
      >
        <v-spacer />
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
  </div>
</template>

<style scoped lang="sass">

</style>
