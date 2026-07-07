<script setup lang="ts">
import { isEqual, range } from "es-toolkit"
import { importHistory } from "~/utils/history-import/import-history"
import type { ValidationResultSuccess } from "~/utils/history-import/read-and-validate"
import type { GameType } from "~~/functions/constants"

const { reveal, args: validationResult, isRevealed, cancel, clearArgs } = useDialogState<ValidationResultSuccess>()
const snackbar = useSnackbar()
const i18n = useI18n()

defineExpose({ reveal })

const indexesToImport = ref<number[]>([])

watch(validationResult, (value) => {
  if (value) {
    indexesToImport.value = range(0, value.games.length)
  }
})

const availableGames = computed(() => {
  return validationResult.value?.games.filter((e, i) => !e.error && indexesToImport.value.includes(i)) ?? []
})

const proceedImport = async () => {
  const query: [GameType, string][] = availableGames.value.map(e => [e.gameType, e.uid])
  const entries = validationResult.value!.dbEntries
    .filter(e => query.some(q => isEqual(q, [e.game, e.uid])))
  const count = await importHistory(entries)
  snackbar.show(i18n.t("import.imported", { count }))
  cancel()
}
</script>

<template>
  <v-dialog
    v-model="isRevealed"
    max-width="500px"
    @after-leave="clearArgs"
  >
    <v-card :title="$t('import.title')">
      <template #text>
        <div
          v-if="validationResult"
          class="d-flex flex-column ga-4"
        >
          <p>{{ $t("import.desc") }}</p>
          <p>{{ $t(`import.notes.${validationResult.format}`) }}</p>
          <div
            v-for="(game, i) in validationResult.games"
            :key="i"
            class="d-flex flex-column"
          >
            <v-checkbox
              v-model="indexesToImport"
              :value="i"
              :disabled="!!game.error"
              hide-details
            >
              <template #label>
                <div class="d-flex flex-column ga-1">
                  <span style="font-size: 1.2em">{{ $t(`games.${game.gameType}`) }}</span>
                  <span>{{ $t('import.uid') }}: {{ game.uid }} / {{ $t('import.gachaCount') }}: {{ game.gachaCount }}</span>
                </div>
              </template>
            </v-checkbox>

            <span
              v-if="game.error"
              class="text-red font-weight-bold pl-6"
            >{{ $t(`import.errors.${game.error}`) }}</span>
          </div>
        </div>
      </template>
      <template #actions>
        <v-spacer />
        <v-btn
          :text="$t('ui.cancel')"
          @click="cancel"
        />
        <v-btn
          :text="$t('import.import')"
          :disabled="availableGames.length === 0"
          @click="proceedImport"
        />
      </template>
    </v-card>
  </v-dialog>
</template>
