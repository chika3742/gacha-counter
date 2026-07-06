<script setup lang="ts">
import { type ExportFormat, exportFormats } from "~/types/history-export.js"
import { exportHistory } from "~/utils/history-export/export-history"
import { type GameType, gameTypes } from "~~/functions/constants.js"

const { isRevealed, reveal, cancel } = useDialogState()

defineExpose({ reveal })

const i18n = useI18n()
const snackbar = useSnackbar()

const selectedFormat = ref<ExportFormat>(exportFormats[0])
const selectedGames = ref<GameType[]>([...gameTypes])

const formatSelectItems = computed(() => {
  return exportFormats.map(format => ({
    name: i18n.t(`export.formats.${format}.name`),
    value: format,
    description: i18n.t(`export.formats.${format}.description`),
  }))
})

const availableGames = computed<GameType[]>(() => {
  const formatToGames: Record<ExportFormat, GameType[]> = {
    "gacha-counter": ["genshin", "hsr", "zzz"],
    "uigf": ["genshin"],
  }

  return formatToGames[selectedFormat.value]
})

const supportedSelectedGames = computed(() => {
  return availableGames.value.filter(e => selectedGames.value.includes(e))
})

const enabledExportButton = computed(() => {
  return supportedSelectedGames.value.length >= 1
})

const proceedExport = async () => {
  try {
    await exportHistory(selectedFormat.value, supportedSelectedGames.value)
    cancel()
  } catch (e) {
    console.error(e)
    snackbar.show(i18n.t("export.failed"), "error")
  }
}
</script>

<template>
  <v-dialog
    v-model="isRevealed"
    max-width="500px"
  >
    <v-card :title="$t('export.title')">
      <template #text>
        <div class="d-flex flex-column">
          <v-select
            v-model="selectedFormat"
            :label="$t('export.format')"
            :items="formatSelectItems"
            item-title="name"
          >
            <template #item="{ props, item }">
              <v-list-item
                v-bind="props"
                :subtitle="item.raw.description"
                lines="two"
              />
            </template>
          </v-select>

          <h4>{{ $t('export.gamesToExport') }}</h4>
          <div class="d-flex flex-column">
            <v-checkbox
              v-for="gameType in gameTypes"
              :key="gameType"
              v-model="selectedGames"
              :value="gameType"
              multiple
              :label="$t(`games.${gameType}`)"
              width="100%"
              hide-details="auto"
              :disabled="!availableGames.includes(gameType)"
              :messages="
                !availableGames.includes(gameType)
                  ? $t('export.gameNotAvailable')
                  : undefined
              "
            />
          </div>
        </div>
      </template>

      <template #actions>
        <v-spacer />
        <v-btn
          variant="text"
          :text="$t('ui.cancel')"
          @click="cancel"
        />
        <v-btn
          variant="text"
          :disabled="!enabledExportButton"
          :text="$t('export.export')"
          @click="proceedExport"
        />
      </template>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="sass"></style>
