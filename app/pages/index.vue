<script setup lang="ts">
import iconGenshin from "~/assets/img/icon_genshin.png"
import iconHsr from "~/assets/img/icon_hsr.png"
import { GachaFetchApiError, GachaFetchClientError } from "~/types/errors.js"

const snackbar = useSnackbar()
const i18n = useI18n()
const config = useConfigStore()
const progress = useFetchProgressStore()

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
]

const url = ref("")
const urlError = ref("")

onMounted(() => {
  url.value = config.url
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

const getHistory = async () => {
  let authkey: string, region: string
  try {
    ({ authkey, region } = parseKeyUrl(url.value, config.game))
  } catch (e) {
    console.warn(e)
    urlError.value = i18n.t("errors.invalidUrl")
    return
  }

  urlError.value = ""

  try {
    await progress.fetch({
      authkey,
      region,
      game: config.game,
      endIds: {}, // TODO
      untilLatestRare: !config.fetchAllHistory,
    })

    config.url = url.value
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

}
</script>

<template>
  <div class="doc-container d-flex flex-column ga-4">
    <v-btn-toggle
      v-model="config.game"
      style="height: 70px"
      :disabled="processing"
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
            width="50px"
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
          v-model="config.fetchAllHistory"
          :disabled="processing || false"
          :label="$t('fetchAllHistory')"
          color="primary"
          density="compact"
          hide-details
        />
        <div style="font-size: 0.9em">
          {{ $t('fetchAllHistoryDesc') }}
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
  </div>
</template>

<style scoped lang="sass">

</style>
