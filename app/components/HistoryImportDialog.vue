<script setup lang="ts">
import { isEqual } from "es-toolkit"
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
    const addedGames: GameType[] = []
    const indexes: number[] = []
    for (let i = 0; i < value.games.length; i++) {
      const game = value.games[i]!
      if (!addedGames.includes(game.gameType)) {
        addedGames.push(game.gameType)
        indexes.push(i)
      }
    }
    indexesToImport.value = indexes
  }
})

const availableGames = computed(() => {
  const games = validationResult.value?.games
  if (!games) {
    return []
  }
  const addedGameTypes: GameType[] = []
  return games.filter((e, i) => {
    if (e.error || !indexesToImport.value.includes(i) || addedGameTypes.includes(e.gameType)) {
      return false
    }
    addedGameTypes.push(e.gameType)
    return true
  })
})

const isAlreadySelectedGameType = (game: ValidationResultSuccess["games"][number]) => {
  return availableGames.value.some(e => e.gameType === game.gameType && e !== game)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" }).format(date)
}

const proceedImport = async () => {
  const query: [GameType, string][] = availableGames.value.map(e => [e.gameType, e.uid])
  const entries = validationResult.value!.dbEntries
    .filter(e => query.some(q => isEqual(q, [e.game, e.uid])))
  try {
    const count = await importHistory(entries)
    snackbar.show(i18n.t("import.imported", { count }))
  } catch (e) {
    console.error(e)
    snackbar.show(i18n.t("import.errors.unknown"), "error")
  }
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
              :disabled="!!game.error || isAlreadySelectedGameType(game)"
              hide-details
            >
              <template #label>
                <div class="d-flex flex-column ga-1">
                  <span style="font-size: 1.2em">{{ $t(`games.${game.gameType}`) }}</span>
                  <span class="text-medium-emphasis">{{ $t('import.uid') }}: {{ game.uid }} / {{ $t('import.gachaCount') }}: {{ game.gachaCount }}</span>
                </div>
              </template>
            </v-checkbox>

            <div
              class="text-red font-weight-bold pl-6"
              style="font-size: 0.92em;"
            >
              <p v-if="game.error">
                {{ $t(`import.errors.${game.error}`) }}
              </p>
              <p v-else-if="isAlreadySelectedGameType(game)">
                {{ $t(`import.errors.cannotImportMultipleAccounts`) }}
              </p>
            </div>
          </div>
          <p class="text-medium-emphasis">
            {{ $t("import.exportedAt") }}: {{ formatDate(validationResult.exportedAt) }}
          </p>
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
